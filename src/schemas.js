import { z } from 'zod';

z.config(z.locales.pt());

export const DURATIONS = [5, 10, 15, 30, 60];

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email(),
  password: z.string().min(6).max(72),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const createPollSchema = z.object({
  question: z.string().trim().min(3).max(140),
  optionA: z.string().trim().min(1).max(60),
  optionB: z.string().trim().min(1).max(60),
  duration: z.literal(DURATIONS, { error: `Duração deve ser ${DURATIONS.join(', ')} minutos` }),
});

export const updatePollSchema = createPollSchema.omit({ duration: true }).partial();

export const voteSchema = z.object({
  choice: z.enum(['A', 'B']),
  voterToken: z.string().min(16).max(64),
});
