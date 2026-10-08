// Cria (ou atualiza) o usuário de demonstração definido no .env
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const { DEMO_EMAIL: email, DEMO_PASSWORD: password } = process.env;

await prisma.user.upsert({
  where: { email },
  update: { password: await bcrypt.hash(password, 10) },
  create: { name: 'Demo', email, password: await bcrypt.hash(password, 10) },
});

console.log(`Usuário demo pronto: ${email}`);
await prisma.$disconnect();
