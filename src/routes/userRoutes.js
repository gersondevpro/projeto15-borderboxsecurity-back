import { Router } from 'express'
import { signUp, signIn } from '../controllers/userController.js';
import { userSchemaValidation } from '../middlewares/userSchema.js';
const router = Router();

router.post('/cadastro',userSchemaValidation, signUp);
router.post("/login", signIn);

export default router;