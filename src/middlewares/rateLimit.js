import rateLimit from 'express-rate-limit';

const options = (windowMin, limit, error) => ({
  windowMs: windowMin * 60 * 1000,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error },
});

export const voteLimiter = rateLimit(options(10, 15, 'Muitos votos deste IP. Tente mais tarde.'));

export const authLimiter = rateLimit(options(15, 10, 'Muitas tentativas. Tente em 15 minutos.'));
