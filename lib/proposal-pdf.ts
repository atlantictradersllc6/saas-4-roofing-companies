import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Estimate } from "./types";
import { money } from "./format";

const TAX_RATE = 0.0825;
const CLAY = rgb(0.706, 0.322, 0.18);
const INK = rgb(0.106, 0.118, 0.137);
const MUTED = rgb(0.486, 0.478, 0.463);
const LINE = rgb(0.85, 0.83, 0.8);

/** Build a branded PDF proposal for one estimate. Returns raw PDF bytes. */
export async function buildProposalPdf(
  estimate: Estimate,
  companyName: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([612, 792]); // US Letter
  const M = 50;
  const right = 612 - M;
  let y = 792 - M;

  const text = (
    s: string,
    x: number,
    yy: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => page.drawText(s, { x, y: yy, size, font: f, color });

  const rightText = (
    s: string,
    xRight: number,
    yy: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => text(s, xRight - f.widthOfTextAtSize(s, size), yy, size, f, color);

  // ---- header band ----
  page.drawRectangle({ x: 0, y: 792 - 8, width: 612, height: 8, color: CLAY });

  text(companyName, M, y, 20, bold);
  rightText("PROPOSAL", right, y, 18, bold, CLAY);
  y -= 18;
  rightText(`${estimate.ref}  ·  ${estimate.date}`, right, y, 10, font, MUTED);
  y -= 26;
  page.drawLine({ start: { x: M, y }, end: { x: right, y }, thickness: 1, color: LINE });
  y -= 26;

  // ---- prepared for ----
  text("PREPARED FOR", M, y, 9, bold, MUTED);
  y -= 15;
  text(estimate.name, M, y, 14, bold);
  y -= 15;
  if (estimate.address) {
    text(estimate.address, M, y, 10, font, MUTED);
    y -= 15;
  }
  y -= 12;

  // ---- roof measurements ----
  const specs: [string, string][] = [
    ["Roof area", `${estimate.squares} squares`],
    ["Pitch", estimate.pitch],
    ["Existing layers", String(estimate.layers)],
    ["Waste factor", estimate.waste],
  ];
  const colW = (right - M) / specs.length;
  specs.forEach(([label, val], i) => {
    const x = M + i * colW;
    text(label.toUpperCase(), x, y, 8, bold, MUTED);
    text(val, x, y - 15, 12, bold);
  });
  y -= 40;
  page.drawLine({ start: { x: M, y }, end: { x: right, y }, thickness: 1, color: LINE });
  y -= 22;

  // ---- line items table ----
  const cQty = right - 190;
  const cRate = right - 110;
  const cAmt = right;
  text("LINE ITEM", M, y, 9, bold, MUTED);
  rightText("QTY", cQty + 20, y, 9, bold, MUTED);
  rightText("RATE", cRate + 15, y, 9, bold, MUTED);
  rightText("AMOUNT", cAmt, y, 9, bold, MUTED);
  y -= 8;
  page.drawLine({ start: { x: M, y }, end: { x: right, y }, thickness: 1, color: LINE });
  y -= 16;

  const descWidth = cQty - M - 12;
  const ensureSpace = () => {
    if (y < 140) {
      page = doc.addPage([612, 792]);
      y = 792 - M;
    }
  };

  for (const l of estimate.lines) {
    ensureSpace();
    const lines = wrap(l.description, font, 10, descWidth);
    lines.forEach((ln, i) => text(ln, M, y - i * 12, 10, font));
    rightText(l.qty, cQty + 20, y, 10, font, MUTED);
    rightText("$" + l.rate.toLocaleString(), cRate + 15, y, 10, font, MUTED);
    rightText(money(l.amount), cAmt, y, 10, bold);
    y -= Math.max(lines.length * 12, 12) + 8;
  }

  // ---- totals ----
  const subtotal = estimate.lines.reduce((a, l) => a + l.amount, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  y -= 4;
  page.drawLine({ start: { x: cQty, y }, end: { x: right, y }, thickness: 1, color: LINE });
  y -= 18;
  const totRow = (label: string, val: string, f = font, size = 10) => {
    text(label, cQty, y, size, f, MUTED);
    rightText(val, cAmt, y, size, f);
    y -= size + 8;
  };
  totRow("Subtotal", money(subtotal));
  totRow("Sales tax (8.25%)", money(tax));
  y -= 4;
  page.drawLine({ start: { x: cQty, y: y + 6 }, end: { x: right, y: y + 6 }, thickness: 1.5, color: INK });
  y -= 6;
  text("TOTAL", cQty, y, 13, bold);
  rightText(money(total), cAmt, y, 13, bold, CLAY);

  // ---- footer ----
  text(companyName, M, 60, 9, bold, MUTED);
  text("License #TX-RCAT-118420  ·  Thank you for the opportunity to earn your business.", M, 46, 9, font, MUTED);
  text("This proposal is valid for 30 days from the date above.", M, 32, 8, font, MUTED);

  return doc.save();
}

/** Greedy word-wrap to a pixel width for the given font/size. */
function wrap(s: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = s.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
      out.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) out.push(cur);
  return out.length ? out : [s];
}
