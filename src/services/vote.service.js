import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';

export const isClosed = (poll) => poll.expiresAt <= new Date();

export async function getResult(poll) {
  const groups = await prisma.vote.groupBy({ by: ['choice'], where: { pollId: poll.id }, _count: true });
  const a = groups.find((g) => g.choice === 'A')?._count ?? 0;
  const b = groups.find((g) => g.choice === 'B')?._count ?? 0;
  const total = a + b;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  return {
    total,
    A: { votes: a, percent: pct(a) },
    B: { votes: b, percent: pct(b) },
    winner: a === b ? 'TIE' : a > b ? 'A' : 'B',
  };
}

async function findBySlug(slug) {
  const poll = await prisma.poll.findUnique({ where: { slug } });
  if (!poll) throw new AppError('Votação não encontrada', 404);
  return poll;
}

export async function getPublic(slug) {
  const poll = await findBySlug(slug);
  const closed = isClosed(poll);
  return {
    question: poll.question,
    optionA: poll.optionA,
    optionB: poll.optionB,
    expiresAt: poll.expiresAt,
    closed,
    result: closed ? await getResult(poll) : null,
  };
}

export async function castVote(slug, { choice, voterToken }) {
  const poll = await findBySlug(slug);
  if (isClosed(poll)) throw new AppError('Votação encerrada', 403);

  try {
    await prisma.vote.create({ data: { choice, voterToken, pollId: poll.id } });
  } catch (err) {
    if (err.code === 'P2002') throw new AppError('Você já votou nesta votação', 409);
    throw err;
  }
  return { message: 'Voto registrado', expiresAt: poll.expiresAt };
}
