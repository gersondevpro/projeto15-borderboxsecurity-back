import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcrypt';
import joi from 'joi';
dotenv.config();

const app = express();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

MongoClient.connect();
db = mongoClient.db("bbs");

app.use(cors());
app.use(express.json());

const userSchema = joi.object({
    name: joi.string().required().min(10).max(100),
    email: joi.string().email().required(),
    password: joi.string().required().min(6),
    confimation: joi.string().required().min(6)
});

const users = db.collection('users');
const sessions = db.collection('sessions');
const products = db.collection('products');

app.get('/', async (req, res) => {
    return res.sendStatus(200);
});

app.post('/cadastro', async (req, res) => {
    const formNewUser = req.body;

    try {

    const validationUser = userSchema.validate(formNewUser, { abortEarly: false });
    if(validationUser.error) {
        const errors = validationUser.error.details.map(fail => fail.message);
        return res.status(401).send(errors)
    };

    const emailDatabase = await users.findOne({email: formNewUser.email})
    if(emailDatabase) {
        return res.status(409).send("Email de usuário já cadastrado. Insira um email válido.")
    }

    if(formNewUser.password !== formNewUser.confimation) {
        return res.status(401).send("Senha e confirmação de senha precisam ser iguais!");
    }
    delete formNewUser.confimation

    const hashPass = bcrypt.hashSync(formNewUser.password, 10);
    await db.users.insertOne({...formNewUser, password: hashPass})

    return res.sendStatus(201);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    };
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {

    const emailDatabase = await users.findOne({ email });
    if(!emailDatabase) {
        return res.status(404).send("Email não cadastrado!");
    }

    const confirmPass = bcrypt.compareSync(password, emailDatabase.password);
    if(!confirmPass) {
        res.status(401).send("Senha incorreta!");
    };

    const token = uuidV4();
    await sessions.insertOne({
        name: emailDatabase.name,
        userId: emailDatabase._id,
        token
    });

    res.status(200).send([token, emailDatabase.name]);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.listen(5000);