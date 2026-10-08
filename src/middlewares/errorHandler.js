import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ error: 'Dados inválidos', details });
  }
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });

  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
