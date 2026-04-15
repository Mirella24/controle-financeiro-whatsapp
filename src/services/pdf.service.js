import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDateBR } from '../utils/formatDate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sanitizeFileName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function ensurePdfDirectory() {
  const pdfDir = path.resolve(__dirname, '../storage/pdfs');

  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  return pdfDir;
}

function drawHeader(doc, personName, totalEntries, totalValue) {
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Relatório Financeiro', 50, 40, {
      width: 495,
      align: 'center'
    });

  doc
    .font('Helvetica')
    .fontSize(11)
    .text(`Responsável: ${personName}`, 50, 85)
    .text(`Emitido em: ${formatDateBR(new Date().toISOString().slice(0, 10))}`, 50, 102)
    .text(`Quantidade de lançamentos: ${totalEntries}`, 50, 119)
    .text(`Valor total: ${formatCurrency(totalValue)}`, 50, 136);

  doc
    .moveTo(50, 160)
    .lineTo(545, 160)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .text('Lançamentos', 50, 175);

  return 200;
}

function drawTableHeader(doc, y) {
  doc.rect(50, y, 495, 24).stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Data', 60, y + 7, { width: 70 })
    .text('Descrição', 140, y + 7, { width: 250 })
    .text('Valor', 430, y + 7, { width: 100, align: 'right' });

  return y + 24;
}

function getRowHeight(doc, description) {
  const textHeight = doc.heightOfString(description, {
    width: 250,
    align: 'left'
  });

  return Math.max(28, textHeight + 12);
}

function createNewPage(doc, personName, totalEntries, totalValue) {
  doc.addPage();
  const y = drawHeader(doc, personName, totalEntries, totalValue);
  return drawTableHeader(doc, y);
}

function drawRows(doc, entries, startY, personName, totalEntries, totalValue) {
  let y = startY;
  const bottomLimit = doc.page.height - 90;

  if (entries.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(11)
      .text('Nenhum lançamento encontrado.', 50, y + 15, {
        width: 495,
        align: 'center'
      });

    return y + 40;
  }

  for (const entry of entries) {
    const rowHeight = getRowHeight(doc, entry.description);

    if (y + rowHeight > bottomLimit) {
      y = createNewPage(doc, personName, totalEntries, totalValue);
    }

    doc.rect(50, y, 495, rowHeight).stroke();

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(formatDateBR(entry.entry_date), 60, y + 8, { width: 70 })
      .text(entry.description, 140, y + 8, { width: 250 })
      .text(formatCurrency(entry.amount), 430, y + 8, {
        width: 100,
        align: 'right'
      });

    y += rowHeight;
  }

  return y;
}

function drawTotal(doc, y, totalValue) {
  const boxWidth = 180;
  const boxHeight = 40;
  const x = 365;

  if (y + boxHeight + 20 > doc.page.height - 60) {
    doc.addPage();
    y = 60;
  }

  doc.rect(x, y + 15, boxWidth, boxHeight).stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Total geral', x + 12, y + 23)
    .text(formatCurrency(totalValue), x + 12, y + 23, {
      width: boxWidth - 24,
      align: 'right'
    });
}

export async function generatePersonReportPdf({ person, entries }) {
  const pdfDir = ensurePdfDirectory();
  const fileName = `relatorio_${sanitizeFileName(person.name)}_${Date.now()}.pdf`;
  const filePath = path.join(pdfDir, fileName);

  const totalValue = entries.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalEntries = entries.length;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      autoFirstPage: true
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    let currentY = drawHeader(doc, person.name, totalEntries, totalValue);
    currentY = drawTableHeader(doc, currentY);
    currentY = drawRows(doc, entries, currentY, person.name, totalEntries, totalValue);
    drawTotal(doc, currentY, totalValue);

    doc.end();

    stream.on('finish', () => {
      resolve({
        fileName,
        filePath
      });
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}