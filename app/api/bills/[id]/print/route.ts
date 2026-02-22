import { NextResponse } from 'next/server';
import { billRepository } from '@/lib/repositories';
import { PDFDocument, rgb } from 'pdf-lib';
// pdf-lib needs fontkit to embed Unicode fonts (Greek characters, etc.)
// We fetch Noto Sans (Regular/Bold) from Google Fonts repo at runtime and cache in-memory.
// This avoids bundling large font binaries in the repo while ensuring correct Greek rendering.
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
  if (cacheRef === 'regular') cachedRegular = buf;
  else cachedBold = buf;
  return buf;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await billRepository.getBill(id);

    // Create PDF
    const pdf = await PDFDocument.create();
    // Enable custom font embedding
    pdf.registerFontkit(fontkit);
    const [regularBytes, boldBytes] = await Promise.all([
      getFontBytes(NOTO_SANS_REGULAR_TTF, 'regular'),
      getFontBytes(NOTO_SANS_BOLD_TTF, 'bold'),
    ]);
    const font = await pdf.embedFont(regularBytes, { subset: true });
    const bold = await pdf.embedFont(boldBytes, { subset: true });
    const page = pdf.addPage([595.28, 841.89]); // A4 in points

    const margin = 40;
    let y = page.getHeight() - margin;
    const drawText = (text: string, size = 12, x = margin, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y, size, font, color });
      y -= size + 6;
    };

    // Header
    drawText(`Λογαριασμός — Τραπέζι ${bill.tableNumber}`, 16);
    const created = new Date(bill.createdAt).toLocaleString('el-GR');
    drawText(`Ημερ/νία: ${created}`, 10);
    if (bill.waiterName) drawText(`Σερβιτόρος: ${bill.waiterName}`, 10);

    y -= 6;
    // Table header
    const colX = { desc: margin, qty: 360, price: 420, total: 490 };
    page.drawText('Περιγραφή', { x: colX.desc, y, size: 11, font: bold });
    page.drawText('Ποσ.', { x: colX.qty, y, size: 11, font: bold });
    page.drawText('Τιμή', { x: colX.price, y, size: 11, font: bold });
    page.drawText('Σύνολο', { x: colX.total, y, size: 11, font: bold });
    y -= 14;

    const lineHeight = 14;
    const ensureSpace = () => {
      if (y < margin + 80) {
        y = page.getHeight() - margin;
      }
    };

    // Items
    for (const it of bill.items) {
      const name = `${it.name}${it.isExtra ? ' (EXTRA)' : ''}`;
      page.drawText(name, { x: colX.desc, y, size: 10, font });
      page.drawText(String(it.quantity ?? 0), { x: colX.qty, y, size: 10, font });
      const unit = typeof it.unitPrice === 'number' ? `€${it.unitPrice.toFixed(2)}` : '-';
      page.drawText(unit, { x: colX.price, y, size: 10, font });
      page.drawText(`€${Number(it.lineTotal || 0).toFixed(2)}`, { x: colX.total, y, size: 10, font });
      y -= lineHeight;
      ensureSpace();
    }

    // Totals
    y -= 6;
    const right = (label: string, value: string) => {
      page.drawText(label, { x: colX.price - 60, y, size: 11, font });
      page.drawText(value, { x: colX.total, y, size: 11, font });
      y -= lineHeight;
    };
    right('Base', `€${bill.subtotalBase.toFixed(2)}`);
    right('+ Extras', `€${bill.subtotalExtras.toFixed(2)}`);
    right(`- Έκπτωση${bill.discountType ? ` (${bill.discountType})` : ''}`, `€${(bill.discountValue ?? 0).toFixed(2)}`);
    page.drawLine({ start: { x: margin, y: y + 4 }, end: { x: page.getWidth() - margin, y: y + 4 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    right('Σύνολο', `€${bill.grandTotal.toFixed(2)}`);

    // Legal disclaimer (non-fiscal)
    y -= 10;
    const disclaimer =
      'Σημείωση: Το παρόν έγγραφο αποτελεί μη φορολογικό παραστατικό/προσωρινή εκτύπωση και δεν υποκαθιστά ' +
      'νόμιμη απόδειξη ή τιμολόγιο. Η νόμιμη απόδειξη εκδίδεται από το φορολογικό μηχανισμό του καταστήματος.';
    const wrapText = (text: string, maxWidth: number, size = 9) => {
      const words = text.split(' ');
      let line = '';
      const lines: string[] = [];
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        const width = font.widthOfTextAtSize(test, size);
        if (width > maxWidth) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };
    const maxTextWidth = page.getWidth() - margin * 2;
    const lines = wrapText(disclaimer, maxTextWidth, 9);
    for (const ln of lines) {
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
        'Content-Disposition': `inline; filename="bill_${bill.tableNumber}_${bill.id.slice(0, 6)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error printing bill:', error);
    if (error?.message === 'Bill not found') {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
