import * as voteService from '../services/vote.service.js';

export const getPublic = async (req, res) => res.json(await voteService.getPublic(req.params.slug));
export const castVote = async (req, res) => res.status(201).json(await voteService.castVote(req.params.slug, req.body));
