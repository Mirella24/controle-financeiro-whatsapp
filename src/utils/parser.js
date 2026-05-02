function parseMessage(text) {
  // console.log("🧩 Parser recebeu:", text);

  if (!text) {
    return { error: "Mensagem vazia" };
  }

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l !== "");

  // console.log("🧩 Linhas:", lines);

  if (lines.length < 3) {
    return { error: "Formato inválido. Use:\nNome\nDescrição\nValor" };
  }

  const name = lines[0];
  const description = lines[1];
  const rawAmount = lines[2].replace(",", ".");
  const date = lines[3] || new Date().toISOString();
  const amount = parseFloat(rawAmount);

  // console.log("🧩 Dados extraídos:", { name, description, amount, date });

  if (!name) return { error: "Nome obrigatório" };
  if (!description) return { error: "Descrição obrigatória" };
  if (isNaN(amount)) return { error: "Valor inválido" };

  return {
    type: "entry",
    name,
    description,
    amount,
    date
  };
}

export { parseMessage };