function normalizar(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function extrairNumeroWhatsApp(remoteJid = '') {
  if (!remoteJid) return '';
  return String(remoteJid).split('@')[0].replace(/\D/g, '');
}

module.exports = {
  normalizar,
  extrairNumeroWhatsApp
};