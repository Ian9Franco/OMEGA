// ===============================================
// OMEGA Finance Dashboard — Parse Statement API
// ===============================================
// Reads MercadoPago .md and PDF files from /documentos and returns parsed JSON.
// PDFs are auto-converted to normalized .md for future reads.

import { NextResponse } from 'next/server';
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { parseMercadoPago } from '@/lib/parser';

// --- Extract text from PDF ---
async function extractPdfText(filePath: string): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch {
    return '';
  }
}

// --- Convert raw PDF text to normalized MD table ---
function pdfTextToNormalizedMd(text: string, filename: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const transactions: string[] = [];

  // Try to extract date-description-amount patterns from PDF text
  // Common MercadoPago PDF patterns:
  // "23/01/2026 Latte vainilla $7.482,59 Cuota 1 de 1"
  // Or simpler: lines with dates, descriptions, and amounts

  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const amountRegex = /\$\s*([\d.,]+)/;
  const cuotaRegex = /[Cc]uota\s*(\d+)\s*de\s*(\d+)/;

  let currentDate = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRegex);
    if (dateMatch) currentDate = dateMatch[1];

    const amountMatch = line.match(amountRegex);
    if (amountMatch && currentDate) {
      // Extract amount
      let amountStr = amountMatch[1].replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) continue;

      // Extract description (everything before the $)
      const descPart = line.split('$')[0].trim();
      // Remove date from description 
      const desc = descPart.replace(dateRegex, '').trim() || `Item ${transactions.length + 1}`;

      // Extract cuota info
      const cuotaMatch = line.match(cuotaRegex);
      const cuota = cuotaMatch ? cuotaMatch[1] : '1';
      const totalCuotas = cuotaMatch ? cuotaMatch[2] : '1';

      // Format date to ISO-like
      const dateParts = currentDate.split(/[\/\-]/);
      const formattedDate = dateParts.length === 3
        ? `${dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
        : currentDate;

      transactions.push(`| ${formattedDate} | ${desc} | ${amount.toFixed(2)} | ${cuota} | ${totalCuotas} | auto |`);
    }
  }

  const sourceType = filename.toLowerCase().includes('visa') ? 'Visa'
    : filename.toLowerCase().includes('master') ? 'Mastercard'
    : filename.toLowerCase().includes('debito') ? 'Débito'
    : 'MercadoPago';

  const now = new Date();
  const periodo = `${now.toLocaleString('es-AR', { month: 'long' })} ${now.getFullYear()}`;

  let md = `# Resumen ${sourceType}\n`;
  md += `periodo: ${periodo}\n`;
  md += `fuente: ${filename} (auto-convertido de PDF)\n\n`;
  md += `## Transacciones\n`;
  md += `| fecha | descripcion | monto | cuota | total_cuotas | categoria |\n`;
  md += `|---|---|---|---|---|---|\n`;

  if (transactions.length > 0) {
    md += transactions.join('\n') + '\n';
  } else {
    // If we couldn't parse transactions, dump the raw text for manual review
    md += `\n<!-- PDF text extraction (review and normalize manually): -->\n`;
    md += `<!-- \n${text.substring(0, 5000)}\n-->\n`;
  }

  return md;
}

export async function GET() {
  try {
    const docsDir = join(process.cwd(), 'documentos');
    const files = await readdir(docsDir);

    // --- Step 1: Auto-convert PDFs to normalized MD ---
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    for (const pdf of pdfFiles) {
      const pdfPath = join(docsDir, pdf);
      const mdName = basename(pdf, '.pdf') + '.md';
      const mdPath = join(docsDir, mdName);

      // Only convert if MD doesn't already exist or PDF is newer
      let shouldConvert = true;
      try {
        const pdfStat = await stat(pdfPath);
        const mdStat = await stat(mdPath);
        if (mdStat.mtime >= pdfStat.mtime) shouldConvert = false;
      } catch {
        // MD doesn't exist yet, need to convert
      }

      if (shouldConvert) {
        const pdfText = await extractPdfText(pdfPath);
        if (pdfText) {
          const normalizedMd = pdfTextToNormalizedMd(pdfText, pdf);
          await writeFile(mdPath, normalizedMd, 'utf-8');
        }
      }
    }

    // --- Step 2: Re-read all files after potential conversions ---
    const updatedFiles = await readdir(docsDir);

    // Find MercadoPago-related .md files
    const mdFiles = updatedFiles.filter(f =>
      f.toLowerCase().endsWith('.md') &&
      (f.toLowerCase().includes('mercadopago') || f.toLowerCase().includes('mercado_pago'))
    );

    // Also try files without .md extension that match
    const mdLikeFiles = updatedFiles.filter(f =>
      f.toLowerCase().includes('mercadopago') && !f.toLowerCase().endsWith('.pdf')
    );

    const allTargets = [...new Set([...mdFiles, ...mdLikeFiles])];

    if (allTargets.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No MercadoPago .md files found in /documentos',
        files: updatedFiles,
        convertedPdfs: pdfFiles
      }, { status: 404 });
    }

    // Parse all found files
    const results = await Promise.all(
      allTargets.map(async (f) => {
        const content = await readFile(join(docsDir, f), 'utf-8');
        return { filename: f, data: parseMercadoPago(content) };
      })
    );

    // Return the file with most transactions (most complete)
    const best = results.sort((a, b) => b.data.transacciones.length - a.data.transacciones.length)[0];

    return NextResponse.json({
      success: true,
      filename: best.filename,
      ...best.data,
      availableFiles: allTargets,
      convertedPdfs: pdfFiles.length > 0 ? pdfFiles : undefined
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
