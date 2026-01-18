import express from 'express';
import { getCurrentUser, searchUsers, getAllUsers } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', getCurrentUser);
router.get('/search', searchUsers);
router.get('/all', getAllUsers);

export default router;

