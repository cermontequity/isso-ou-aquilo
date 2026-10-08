import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';

const session = (user) => ({
  token: jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' }),
  user: { id: user.id, name: user.name, email: user.email },
});

export async function register({ name, email, password }) {
  if (await prisma.user.findUnique({ where: { email } })) throw new AppError('Email já cadastrado', 409);

  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10) },
  });
  return session(user);
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Email ou senha inválidos', 401);
  }
  return session(user);
}
