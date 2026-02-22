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

    // Page: κανονικό A4
    const PAGE_WIDTH = 595.28;  // A4 πλάτος (pt)
    const PAGE_HEIGHT = 841.89; // A4 ύψος (pt)
    // Receipt column: ~80mm πλάτος (2/5 ~ 1/3 του A4) κεντραρισμένο
    const RECEIPT_WIDTH = 226.77; // 80mm σε pt (κρατάμε thermal πλάτος)
    const margin = 20; // πλευρικό padding μέσα στη στήλη της απόδειξης
    const leftXBase = (PAGE_WIDTH - RECEIPT_WIDTH) / 2; // κεντράρισμα στήλης

    // Helpers
    const wrapText = (text: string, maxWidth: number, size = 10, f = font) => {
      const words = String(text ?? '').split(' ');
      let line = '';
      const lines: string[] = [];
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        const width = f.widthOfTextAtSize(test, size);
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

    // Column layout for narrow receipt (right-aligned numeric columns to prevent right overflow)
    // | desc ........... | qty | price | total |
    const TOTAL_RIGHT = leftXBase + RECEIPT_WIDTH - margin; // δεξί άκρο στήλης
    const PRICE_RIGHT = TOTAL_RIGHT - 36;                   // 36pt αριστερά από το total
    const QTY_RIGHT = PRICE_RIGHT - 26;                     // 26pt αριστερά από το price
    const col = {
      descX: leftXBase + margin,
      qtyRight: QTY_RIGHT,
      priceRight: PRICE_RIGHT,
      totalRight: TOTAL_RIGHT,
    } as const;
    const descMaxWidth = (leftXBase + RECEIPT_WIDTH - margin) - col.descX - 2; // διαθέσιμο πλάτος περιγραφής

    // Measure content height (two-pass rendering)
    const headerSizeLarge = 12;
    const headerSizeSmall = 9;
    const itemFontSize = 9;
    const labelFontSize = 9.5;
    const lineGap = 4; // extra gap μεταξύ γραμμών
    const lineH = (size: number) => size + lineGap;

    let neededHeight = 0;
    // Header
    neededHeight += lineH(headerSizeLarge); // τίτλος
    neededHeight += lineH(headerSizeSmall); // ημερομηνία
    if (bill.waiterName) neededHeight += lineH(headerSizeSmall); // σερβιτόρος
    neededHeight += 2; // μικρό κενό
    // Table header
    neededHeight += lineH(labelFontSize);

    // Items (wrap περιγραφή σε πολλές γραμμές στο στενό πλάτος)
    for (const it of bill.items) {
      const name = `${it.name}${it.isExtra ? ' (EXTRA)' : ''}`;
      const nameLines = wrapText(name, descMaxWidth, itemFontSize, font);
      neededHeight += lineH(itemFontSize) * Math.max(1, nameLines.length);
    }

    // Totals
    neededHeight += lineH(labelFontSize) * 4;

    // Disclaimer (wrap)
    const disclaimer =
      'Σημείωση: Το παρόν έγγραφο αποτελεί μη φορολογικό παραστατικό/προσωρινή εκτύπωση και δεν υποκαθιστά νόμιμη απόδειξη ή τιμολόγιο. Η νόμιμη απόδειξη εκδίδεται από το φορολογικό μηχανισμό του καταστήματος.';
    const disclaimerLines = wrapText(disclaimer, RECEIPT_WIDTH - margin * 2, 8.5, font);
    neededHeight += lineH(8.5) * disclaimerLines.length;

    // Σελίδα: πάντα A4. Το περιεχόμενο (receipt) ρέει σε κεντραρισμένη στήλη.
    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = page.getHeight() - margin;
    const drawText = (text: string, size = 10, x = margin, color = rgb(0, 0, 0), f = font) => {
      page.drawText(text, { x, y, size, font: f, color });
      y -= lineH(size);
    };
    // Βοηθητικό: κεντραρισμένο κείμενο μέσα στη στήλη της απόδειξης
    const drawCenteredInReceipt = (text: string, size = 10, f = font, color = rgb(0, 0, 0)) => {
      const textWidth = f.widthOfTextAtSize(text, size);
      const x = leftXBase + (RECEIPT_WIDTH - textWidth) / 2;
      page.drawText(text, { x, y, size, font: f, color });
      y -= lineH(size);
    };

    // Header
    // Header (κεντραρισμένος στη στήλη)
    drawCenteredInReceipt(`Λογαριασμός — Τραπέζι ${bill.tableNumber}`, headerSizeLarge, bold);
    const created = new Date(bill.createdAt).toLocaleString('el-GR');
    drawCenteredInReceipt(`Ημερ/νία: ${created}`, headerSizeSmall, font);
    if (bill.waiterName) drawCenteredInReceipt(`Σερβιτόρος: ${bill.waiterName}`, headerSizeSmall, font);

    y -= 6;
    // Table header
    page.drawText('Περιγραφή', { x: col.descX, y, size: labelFontSize, font: bold });
    // Δεξιά στοίχιση επικεφαλίδων για να ταιριάζουν με τις στήλες
    const qtyHeader = 'Ποσ.';
    const qtyHX = col.qtyRight - bold.widthOfTextAtSize(qtyHeader, labelFontSize);
    page.drawText(qtyHeader, { x: qtyHX, y, size: labelFontSize, font: bold });
    const priceHeader = 'Τιμή';
    const priceHX = col.priceRight - bold.widthOfTextAtSize(priceHeader, labelFontSize);
    page.drawText(priceHeader, { x: priceHX, y, size: labelFontSize, font: bold });
    const totalHeader = 'Σύνολο';
    const totalHX = col.totalRight - bold.widthOfTextAtSize(totalHeader, labelFontSize);
    page.drawText(totalHeader, { x: totalHX, y, size: labelFontSize, font: bold });
    y -= lineH(labelFontSize);

    const ensureSpace = (needed = lineH(itemFontSize)) => {
      if (y < margin + needed) {
        // Νέα σελίδα A4, συνέχεια από την κορυφή.
        const p = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        page = p;
        y = page.getHeight() - margin;
      }
    };

    // Items
    for (const it of bill.items) {
      const name = `${it.name}${it.isExtra ? ' (EXTRA)' : ''}`;
      const nameLines = wrapText(name, descMaxWidth, itemFontSize, font);
      if (nameLines.length === 0) nameLines.push('');
      // Πρώτη γραμμή: με ποσότητα/τιμή/σύνολο (δεξιά στοίχιση για αποφυγή overflow δεξιά)
      page.drawText(nameLines[0], { x: col.descX, y, size: itemFontSize, font });
      const qtyStr = String(it.quantity ?? 0);
      const qtyX = col.qtyRight - font.widthOfTextAtSize(qtyStr, itemFontSize);
      page.drawText(qtyStr, { x: qtyX, y, size: itemFontSize, font });
      const unit = typeof it.unitPrice === 'number' ? `€${it.unitPrice.toFixed(2)}` : '-';
      const priceX = col.priceRight - font.widthOfTextAtSize(unit, itemFontSize);
      page.drawText(unit, { x: priceX, y, size: itemFontSize, font });
      const totalStr = `€${Number(it.lineTotal || 0).toFixed(2)}`;
      const totalX = col.totalRight - font.widthOfTextAtSize(totalStr, itemFontSize);
      page.drawText(totalStr, { x: totalX, y, size: itemFontSize, font });
      y -= lineH(itemFontSize);
      // Επόμενες γραμμές: μόνο η περιγραφή (τυλίγματα)
      for (let i = 1; i < nameLines.length; i++) {
        page.drawText(nameLines[i], { x: col.descX, y, size: itemFontSize, font });
        y -= lineH(itemFontSize);
      }
      ensureSpace();
    }

    // Totals (ευθυγράμμιση αριστερά όπως ζητήθηκε)
    y -= 6;
    const drawLeft = (label: string, value?: string, boldValue = false) => {
      const text = value ? `${label}: ${value}` : label;
      page.drawText(text, { x: margin, y, size: labelFontSize, font: boldValue ? bold : font });
      y -= lineH(labelFontSize);
    };
    // Draw totals στην ίδια κεντραρισμένη στήλη
    const leftEdge = leftXBase + margin;
    const drawLeftAtColumn = (label: string, value?: string, boldValue = false) => {
      const text = value ? `${label}: ${value}` : label;
      page.drawText(text, { x: leftEdge, y, size: labelFontSize, font: boldValue ? bold : font });
      y -= lineH(labelFontSize);
    };
    drawLeftAtColumn('Base', `€${bill.subtotalBase.toFixed(2)}`);
    drawLeftAtColumn('Extras', `€${bill.subtotalExtras.toFixed(2)}`);
    drawLeftAtColumn(`Έκπτωση${bill.discountType ? ` (${bill.discountType})` : ''}`, `€${(bill.discountValue ?? 0).toFixed(2)}`);
    // Διαχωριστική γραμμή πριν το τελικό σύνολο
    page.drawLine({ start: { x: leftXBase + margin, y: y + 2 }, end: { x: leftXBase + RECEIPT_WIDTH - margin, y: y + 2 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 2;
    drawLeftAtColumn('Σύνολο', `€${bill.grandTotal.toFixed(2)}`, true);

    // Legal disclaimer (non-fiscal)
    y -= 10;
    const maxTextWidth = RECEIPT_WIDTH - margin * 2;
    for (const ln of disclaimerLines) {
      page.drawText(ln, { x: leftXBase + margin, y, size: 8.5, font, color: rgb(0.4, 0.4, 0.4) });
      y -= lineH(8.5);
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
