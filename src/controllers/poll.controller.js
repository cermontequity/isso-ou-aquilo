import * as pollService from '../services/poll.service.js';

export const create = async (req, res) => res.status(201).json(await pollService.create(req.userId, req.body));
export const list = async (req, res) => res.json(await pollService.list(req.userId));
export const getById = async (req, res) => res.json(await pollService.getById(req.userId, req.params.id));
export const update = async (req, res) => res.json(await pollService.update(req.userId, req.params.id, req.body));
export const remove = async (req, res) => {
  await pollService.remove(req.userId, req.params.id);
  res.status(204).end();
};
