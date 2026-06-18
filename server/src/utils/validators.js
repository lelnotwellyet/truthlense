import { body, query, param } from 'express-validator';
import { validationResult } from 'express-validator';

/** Middleware to check validation results and return errors */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

export const validateSignup = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  validate,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const validateVerifyText = [
  body('text').trim().isLength({ min: 10 }).withMessage('Text must be at least 10 characters'),
  validate,
];

export const validateVerifyUrl = [
  body('url').isURL().withMessage('Valid URL is required'),
  validate,
];

export const validateVote = [
  body('report_id').isUUID().withMessage('Valid report ID is required'),
  body('vote_type').isIn(['up', 'down']).withMessage('Vote type must be "up" or "down"'),
  validate,
];

export const validateBookmark = [
  body('type').isIn(['article', 'report']).withMessage('Type must be "article" or "report"'),
  validate,
];
