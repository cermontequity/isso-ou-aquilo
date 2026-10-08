import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { registerSchema, loginSchema } from '../schemas.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);

export default router;
