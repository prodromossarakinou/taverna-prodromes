import { NextResponse } from 'next/server';
import { menuRepository } from '@/lib/repositories';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Remote TTF sources (public GitHub raw links)
const NOTO_SANS_REGULAR_TTF =
  'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const NOTO_SANS_BOLD_TTF =
  'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

let cachedRegular: Uint8Array | null = null;
let cachedBold: Uint8Array | null = null;

async function getFontBytes(url: string, cacheRef: 'regular' | 'bold'): Promise<Uint8Array> {
  if (cacheRef === 'regular' && cachedRegular) return cachedRegular;
  if (cacheRef === 'bold' && cachedBold) return cachedBold;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (cacheRef === 'regular') cachedRegular = buf; else cachedBold = buf;
  return buf;
}

export async function GET() {
  try {
    const items = await menuRepository.getMenuItems();
    // Group by category
    const byCategory = new Map<string, typeof items>();
    for (const it of items) {
      if (it.active === false) continue; // show only active
      const key = it.category;
      const arr = byCategory.get(key) ?? [];
      arr.push(it);
      byCategory.set(key, arr);
    }
    // Sort categories by predefined order (if possible)
    const CAT_ORDER = ['Κρύα', 'Ζεστές', 'Ψησταριά', 'Μαγειρευτό', 'Ποτά'];
    const entries = Array.from(byCategory.entries()).sort((a, b) => {
      const ia = CAT_ORDER.indexOf(a[0]);
      const ib = CAT_ORDER.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0], 'el');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    // Sort items by name within category
    for (const [, arr] of entries) {
      arr.sort((x, y) => x.name.localeCompare(y.name, 'el'));
    }

    // Create PDF
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const [regularBytes, boldBytes] = await Promise.all([
      getFontBytes(NOTO_SANS_REGULAR_TTF, 'regular'),
      getFontBytes(NOTO_SANS_BOLD_TTF, 'bold'),
    ]);
    const font = await pdf.embedFont(regularBytes, { subset: true });
    const bold = await pdf.embedFont(boldBytes, { subset: true });
    let page = pdf.addPage([595.28, 841.89]); // A4

    const margin = 40;
    let y = page.getHeight() - margin;
    const line = (thickness = 0.5, color = rgb(0.85, 0.85, 0.85)) => {
      page.drawLine({ start: { x: margin, y }, end: { x: page.getWidth() - margin, y }, thickness, color });
      y -= 10;
    };
    const draw = (text: string, size = 12, x = margin, f: typeof font | typeof bold = font, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y, size, font: f, color });
      y -= size + 6;
    };
    const ensureSpace = (needed = 60) => {
      if (y < margin + needed) {
        // Add new page
        const p = pdf.addPage([595.28, 841.89]);
        // Switch drawing context to the newly added page
        page = p;
        y = page.getHeight() - margin;
      }
    };

    // Header
    draw('Ζωντανό Μενού', 20, margin, bold);
    const ts = new Date().toLocaleString('el-GR');
    draw(`Ενημέρωση: ${ts}`, 10);
    line();

    // Columns positions
    const colX = { name: margin, price: page.getWidth() - margin - 80 };

    // Render categories and items
    for (const [cat, arr] of entries) {
      ensureSpace(40);
      draw(String(cat).toUpperCase(), 13, margin, bold, rgb(0.1, 0.1, 0.6));
      for (const it of arr) {
        ensureSpace(20);
        const price = typeof it.price === 'number' ? `€${it.price.toFixed(2)}` : '-';
        page.drawText(it.name, { x: colX.name, y, size: 11, font });
        page.drawText(price, { x: colX.price, y, size: 11, font });
        y -= 14;
      }
      y -= 2;
      line();
    }

    // Disclaimer
    y -= 6;
    const disclaimer =
      'Σημείωση: Το παρόν έγγραφο αποτελεί μη φορολογικό παραστατικό/προσωρινή εκτύπωση και δεν υποκαθιστά νόμιμη απόδειξη. Οι τιμές ενδέχεται να αλλάξουν.';
    const wrap = (text: string, maxWidth: number, size = 9) => {
      const words = text.split(' ');
      let cur = '';
      const out: string[] = [];
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) > maxWidth) {
          if (cur) out.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      }
      if (cur) out.push(cur);
      return out;
    };
    const maxWidth = page.getWidth() - margin * 2;
    for (const ln of wrap(disclaimer, maxWidth, 9)) {
      page.drawText(ln, { x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 12;
    }

    const bytes = await pdf.save();
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    const blob = new Blob([copy], { type: 'application/pdf' });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="live_menu.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error printing live menu:', error);
    return NextResponse.json({ error: 'Failed to generate menu PDF' }, { status: 500 });
  }
}
