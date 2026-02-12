import express from 'express';
import { getMessage, getOnlineUser} from '../controllers/message.controller.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', isAuth, getMessage);
router.get('/online', isAuth, getOnlineUser);

export default router;