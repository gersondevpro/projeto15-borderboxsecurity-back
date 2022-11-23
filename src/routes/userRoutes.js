import { Router } from 'express'
import { signUp, signIn } from '../controllers/userController.js';

const router = Router();

router.post('/cadastro', signUp);
router.post("/login", signIn);

export default router;