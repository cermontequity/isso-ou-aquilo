import { randomBytes } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';
import { getResult, isClosed } from './vote.service.js';

// O criador vê quantos votaram, mas o resultado só aparece depois de encerrar
async function format(poll) {
  const closed = isClosed(poll);
  return {
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    optionA: poll.optionA,
    optionB: poll.optionB,
    expiresAt: poll.expiresAt,
    closed,
    totalVotes: await prisma.vote.count({ where: { pollId: poll.id } }),
    result: closed ? await getResult(poll) : null,
  };
}

async function findOwned(userId, id) {
  const poll = await prisma.poll.findFirst({ where: { id: Number(id) || 0, userId } });
  if (!poll) throw new AppError('Votação não encontrada', 404);
  return poll;
}

export async function create(userId, { question, optionA, optionB, duration }) {
  const poll = await prisma.poll.create({
    data: {
      question,
      optionA,
      optionB,
      slug: randomBytes(12).toString('base64url'), // link aleatório, não derivado do id
      expiresAt: new Date(Date.now() + duration * 60 * 1000),
      userId,
    },
  });
  return format(poll);
}

export async function list(userId) {
  const polls = await prisma.poll.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return Promise.all(polls.map(format));
}

export async function getById(userId, id) {
  return format(await findOwned(userId, id));
}

export async function update(userId, id, data) {
  const poll = await findOwned(userId, id);
  if (await prisma.vote.count({ where: { pollId: poll.id } })) {
    throw new AppError('Não é possível editar uma votação que já recebeu votos', 409);
  }
  return format(await prisma.poll.update({ where: { id: poll.id }, data }));
}

export async function remove(userId, id) {
  const poll = await findOwned(userId, id);
  await prisma.poll.delete({ where: { id: poll.id } });
}
