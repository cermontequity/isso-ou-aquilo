import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.routes.js';
import pollRoutes from './routes/poll.routes.js';
import voteRoutes from './routes/vote.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.static(publicDir));

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/p', voteRoutes);

// Página de votação acessada pelo link compartilhado
app.get('/v/:slug', (req, res) => res.sendFile('vote.html', { root: publicDir }));

app.use(errorHandler);

// HOST=127.0.0.1 deixa a API acessível só neste computador
app.listen(process.env.PORT, process.env.HOST, () =>
  console.log(`Rodando em http://${process.env.HOST}:${process.env.PORT}`),
);
