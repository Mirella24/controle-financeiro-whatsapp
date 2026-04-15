import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import testRoutes from './routes/test.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'API online'
  });
});

app.use('/', healthRoutes);
app.use('/', testRoutes);
app.use('/', webhookRoutes);

export default app;