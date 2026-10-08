import jwt from 'jsonwebtoken';
import { AppError } from '../lib/AppError.js';

export function auth(req, res, next) {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) throw new AppError('Token não informado', 401);

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
