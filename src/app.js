import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcrypt';
import joi from 'joi';
dotenv.config();

const app = express();

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
let db;

mongoClient.connect();
db = mongoClient.db("bbs");

app.use(cors());
app.use(express.json());

const userSchema = joi.object({
    name: joi.string().required().min(3).max(20),
    lastName: joi.string().required().min(3).max(20),
    email: joi.string().email().required(),
    password: joi.string().required().min(6),
    confirmation: joi.string().required().min(6)
});

const users = db.collection('users');
const sessions = db.collection('sessions');
const products = db.collection('products');

app.get('/', async (req, res) => {
    const usuarios = await users.find().toArray()
    return res.status(200).send(usuarios);
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

    if(formNewUser.password !== formNewUser.confirmation) {
        return res.status(401).send("Senha e confirmação de senha precisam ser iguais!");
    }
    delete formNewUser.confirmation

    const hashPass = bcrypt.hashSync(formNewUser.password, 10);
    await users.insertOne({...formNewUser, password: hashPass})

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
        return res.status(404).send("Email inválido!");
    }

    const confirmPass = bcrypt.compareSync(password, emailDatabase.password);
    if(!confirmPass) {
        return res.status(401).send("Senha incorreta!");
    };

    const token = uuidV4();
    await sessions.insertOne({
        name: emailDatabase.name,
        userId: emailDatabase._id,
        token
    });

    return res.status(200).send([token, emailDatabase.name]);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.listen(5000);