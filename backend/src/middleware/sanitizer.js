import { sanitizeMessage } from '../utils/helpers.js';

export const sanitizeInput = (req, res, next) => {
  if (req.body.content) {
    req.body.content = sanitizeMessage(req.body.content);
  }
  if (req.body.username) {
    req.body.username = req.body.username.trim();
  }
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  next();
};

