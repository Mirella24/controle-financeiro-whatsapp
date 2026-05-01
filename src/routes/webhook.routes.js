import { Router } from 'express';
import { evolutionWebhook } from '../controllers/webhook.controller.js';

const router = Router();

router.post('/webhook', evolutionWebhook);

export default router;
