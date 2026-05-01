export function formatarDataUTC(dataStr) {
  const [dia, mes, ano] = dataStr.split('/');

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return data.toISOString();
}