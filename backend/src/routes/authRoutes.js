import express from 'express';
import { register, login, refresh, logout } from '../controllers/authController.js';
import { validate, registerValidation, loginValidation } from '../utils/validators.js';
import { sanitizeInput } from '../middleware/sanitizer.js';

const router = express.Router();

router.post('/register',
    sanitizeInput,
    validate(registerValidation),
    register
);

router.post('/login',
    sanitizeInput,
    validate(loginValidation),
    login
);

router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;

