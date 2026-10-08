import rateLimit from 'express-rate-limit';

const options = (windowMin, limit, error) => ({
  windowMs: windowMin * 60 * 1000,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error },
});

// Grupos costumam votar da mesma rede (mesmo IP), então o limite não pode ser 1.
// 15 votos a cada 10 min por IP cobre um grupo e trava scripts de voto em massa.
// O IP fica só na memória do limitador, nunca no banco: o voto continua anônimo.
export const voteLimiter = rateLimit(options(10, 15, 'Muitos votos deste IP. Tente mais tarde.'));

// Contra força bruta no login/cadastro
export const authLimiter = rateLimit(options(15, 10, 'Muitas tentativas. Tente em 15 minutos.'));
