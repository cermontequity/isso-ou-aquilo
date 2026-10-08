import { Router } from 'express';
import * as ctrl from '../controllers/vote.controller.js';
import { validate } from '../middlewares/validate.js';
import { voteLimiter } from '../middlewares/rateLimit.js';
import { voteSchema } from '../schemas.js';

const router = Router();

// Rotas públicas: quem vota não precisa de conta, só do link
router.get('/:slug', ctrl.getPublic);
router.post('/:slug/vote', voteLimiter, validate(voteSchema), ctrl.castVote);

export default router;
