import express from "express";
import cors from 'cors';
import joi from 'joi';
import userRouter from './routes/userRoutes.js'
import { users } from './database/db.js'

const app = express();

app.use(cors());
app.use(express.json());
app.use(userRouter);

export const userSchema = joi.object({
    name: joi.string().required().min(3).max(20),
    lastName: joi.string().required().min(3).max(20),
    email: joi.string().email().required(),
    password: joi.string().required().min(6),
    confirmation: joi.string().required().min(6)
});

app.get('/', async (req, res) => {
    const usuarios = await users.find().toArray()
    return res.status(200).send(usuarios);
});

app.listen(5000);