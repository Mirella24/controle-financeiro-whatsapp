import { Router } from 'express';
import {
  createTestEntry,
  getEntriesByPerson
} from '../controllers/test.controller.js';

const router = Router();

router.post('/test/entry', createTestEntry);
router.get('/test/entries/:name', getEntriesByPerson);

export default router;