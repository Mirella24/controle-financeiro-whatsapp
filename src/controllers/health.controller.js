export function healthCheck(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'API online'
  });
}