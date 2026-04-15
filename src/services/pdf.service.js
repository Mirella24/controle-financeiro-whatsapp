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

function drawFooter(doc) {
  const footerY = doc.page.height - 35;

  doc
    .font('Helvetica')
    .fontSize(9)
    .text('Relatório gerado automaticamente pelo sistema', 50, footerY, {
      width: 495,
      align: 'center'
    });
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

function drawTableHeader(doc, y, columns) {
  const { x, dateW, descW, valueW, rowH } = columns;
  const totalW = dateW + descW + valueW;

  doc.rect(x, y, totalW, rowH).stroke();

  doc
    .moveTo(x + dateW, y)
    .lineTo(x + dateW, y + rowH)
    .stroke();

  doc
    .moveTo(x + dateW + descW, y)
    .lineTo(x + dateW + descW, y + rowH)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Data', x + 8, y + 8, { width: dateW - 16 })
    .text('Descrição', x + dateW + 8, y + 8, { width: descW - 16 })
    .text('Valor', x + dateW + descW + 8, y + 8, {
      width: valueW - 16,
      align: 'right'
    });

  return y + rowH;
}

function getRowHeight(doc, description, columns) {
  const textHeight = doc.heightOfString(description, {
    width: columns.descW - 16,
    align: 'left'
  });

  return Math.max(28, textHeight + 14);
}

function createNewPage(doc, personName, totalEntries, totalValue, columns) {
  doc.addPage();
  let y = drawHeader(doc, personName, totalEntries, totalValue);
  y = drawTableHeader(doc, y, columns);
  return y;
}

function drawRow(doc, y, entry, rowHeight, columns) {
  const { x, dateW, descW, valueW } = columns;
  const totalW = dateW + descW + valueW;

  doc.rect(x, y, totalW, rowHeight).stroke();

  doc
    .moveTo(x + dateW, y)
    .lineTo(x + dateW, y + rowHeight)
    .stroke();

  doc
    .moveTo(x + dateW + descW, y)
    .lineTo(x + dateW + descW, y + rowHeight)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(10)
    .text(formatDateBR(entry.entry_date), x + 8, y + 8, {
      width: dateW - 16
    })
    .text(entry.description, x + dateW + 8, y + 8, {
      width: descW - 16
    })
    .text(formatCurrency(entry.amount), x + dateW + descW + 8, y + 8, {
      width: valueW - 16,
      align: 'right'
    });
}

function drawRows(doc, entries, startY, personName, totalEntries, totalValue, columns) {
  let y = startY;
  const bottomLimit = doc.page.height - 90;

  if (entries.length === 0) {
    const totalW = columns.dateW + columns.descW + columns.valueW;

    doc.rect(columns.x, y, totalW, 35).stroke();

    doc
      .font('Helvetica')
      .fontSize(11)
      .text('Nenhum lançamento encontrado.', columns.x, y + 11, {
        width: totalW,
        align: 'center'
      });

    return y + 35;
  }

  for (const entry of entries) {
    const rowHeight = getRowHeight(doc, entry.description, columns);

    if (y + rowHeight > bottomLimit) {
      drawFooter(doc);
      y = createNewPage(doc, personName, totalEntries, totalValue, columns);
    }

    drawRow(doc, y, entry, rowHeight, columns);
    y += rowHeight;
  }

  return y;
}

function drawTotal(doc, y, totalValue) {
  const boxWidth = 180;
  const boxHeight = 40;
  const x = 365;

  if (y + boxHeight + 20 > doc.page.height - 60) {
    drawFooter(doc);
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

  const columns = {
    x: 50,
    dateW: 90,
    descW: 285,
    valueW: 120,
    rowH: 28
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      autoFirstPage: true
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    let currentY = drawHeader(doc, person.name, totalEntries, totalValue);
    currentY = drawTableHeader(doc, currentY, columns);
    currentY = drawRows(doc, entries, currentY, person.name, totalEntries, totalValue, columns);
    drawTotal(doc, currentY, totalValue);
    drawFooter(doc);

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