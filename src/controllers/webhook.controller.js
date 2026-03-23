const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

// 🔹 Verificação da Meta
function verificarWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso!');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

// 🔹 Recebimento de mensagens
async function receberWebhook(req, res) {
  console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));

  return res.sendStatus(200);
}

module.exports = {
  verificarWebhook,
  receberWebhook
};