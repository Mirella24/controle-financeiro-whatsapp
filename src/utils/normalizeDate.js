export function formatarDataUTC(dataStr) {
  let data;

  if (!dataStr) {
    data = new Date();
  } else {
    const partes = dataStr.split('/');

    let dia, mes, ano;

    if (partes.length === 2) {
      [dia, mes] = partes;
      ano = new Date().getFullYear();
    } else if (partes.length === 3) {
      [dia, mes, ano] = partes;
    } else {
      return dataAtualFormatada();
    }

    dia = Number(dia);
    mes = Number(mes);
    ano = Number(ano);

    // 🔥 cria data
    const dataTeste = new Date(Date.UTC(ano, mes - 1, dia));

    // 🔥 valida se o JS "corrigiu"
    const diaValido = dataTeste.getUTCDate() === dia;
    const mesValido = dataTeste.getUTCMonth() + 1 === mes;
    const anoValido = dataTeste.getUTCFullYear() === ano;

    if (!diaValido || !mesValido || !anoValido) {
      return dataAtualFormatada(); // 🔥 fallback
    }

    data = dataTeste;
  }

  return formatar(data);
}

// =========================
// helpers
// =========================
function formatar(date) {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const a = date.getUTCFullYear();

  return `${d}-${m}-${a}`;
}

function dataAtualFormatada() {
  return formatar(new Date());
}