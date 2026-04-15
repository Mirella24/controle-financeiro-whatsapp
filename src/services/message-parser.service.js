import { normalizeText } from '../utils/normalizeText.js';
import { parseDateToIso } from '../utils/formatDate.js';

function cleanLines(text = '') {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function isNumericValue(value = '') {
  const normalized = value.replace(',', '.').trim();
  return !Number.isNaN(Number(normalized));
}

function parseAmount(value = '') {
  return Number(value.replace(',', '.').trim());
}

export function parseIncomingMessage(text = '') {
  const originalText = text.trim();
  const normalizedText = normalizeText(originalText);

  if (!originalText) {
    return {
      type: 'invalid',
      message: 'Mensagem vazia'
    };
  }

  if (
    normalizedText.startsWith('pdf ') ||
    normalizedText.startsWith('relatorio ')
  ) {
    const parts = originalText.split(' ');
    const command = normalizeText(parts.shift() || '');
    const name = parts.join(' ').trim();

    if (!name) {
      return {
        type: 'invalid',
        message: 'Nome não informado no comando de relatório'
      };
    }

    return {
      type: 'report',
      command,
      name
    };
  }

  const lines = cleanLines(originalText);

  if (lines.length < 3 || lines.length > 4) {
    return {
      type: 'invalid',
      message: 'Mensagem deve ter 3 ou 4 linhas'
    };
  }

  const [name, description, amountLine, dateLine = ''] = lines;

  if (!isNumericValue(amountLine)) {
    return {
      type: 'invalid',
      message: 'Valor inválido'
    };
  }

  return {
    type: 'entry',
    name,
    description,
    amount: parseAmount(amountLine),
    entryDate: parseDateToIso(dateLine)
  };
}