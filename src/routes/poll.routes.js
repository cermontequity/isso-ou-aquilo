import { Router } from 'express';
import * as ctrl from '../controllers/poll.controller.js';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createPollSchema, updatePollSchema } from '../schemas.js';

const router = Router();

router.use(auth); // todas as rotas do criador são protegidas

router.post('/', validate(createPollSchema), ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.put('/:id', validate(updatePollSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
