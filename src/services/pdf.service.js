const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

async function gerarPdfPessoa(nomePessoa, lancamentos) {
  const pasta = path.resolve(process.cwd(), 'storage', 'pdfs');
  fs.mkdirSync(pasta, { recursive: true });

  const nomeArquivo = `relatorio-${nomePessoa.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const caminhoArquivo = path.join(pasta, nomeArquivo);

  const total = lancamentos.reduce((soma, item) => soma + Number(item.amount), 0);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(caminhoArquivo);

    doc.pipe(stream);

    doc.fontSize(18).text(`Relatório de ${nomePessoa}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Quantidade de lançamentos: ${lancamentos.length}`);
    doc.text(`Total final: ${formatarMoeda(total)}`);
    doc.moveDown();

    lancamentos.forEach((item, index) => {
      const data = new Date(item.launch_date).toLocaleDateString('pt-BR');
      doc.text(
        `${index + 1}. ${data} | ${item.description} | ${formatarMoeda(item.amount)}`
      );
    });

    doc.end();

    stream.on('finish', () => {
      resolve({
        caminhoArquivo,
        nomeArquivo,
        total
      });
    });

    stream.on('error', reject);
  });
}

module.exports = {
  gerarPdfPessoa
};