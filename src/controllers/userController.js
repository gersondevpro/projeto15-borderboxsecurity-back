import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcrypt';
import { userSchema } from '../app.js'
import { users, sessions } from '../database/db.js'

async function signUp(req, res) {
    const formNewUser = req.body;

    try {
        const emailDatabase = await users.findOne({ email: formNewUser.email })
        if (emailDatabase) {
            return res.status(409).send("Email de usuário já cadastrado. Insira um email válido.")
        }

        if (formNewUser.password !== formNewUser.confirmation) {
            return res.status(401).send("Senha e confirmação de senha precisam ser iguais!");
        }
        delete formNewUser.confirmation

        const hashPass = bcrypt.hashSync(formNewUser.password, 10);
        await users.insertOne({ ...formNewUser, password: hashPass })

        return res.sendStatus(201);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    };
};

async function signIn(req, res) {
    const { email, password } = req.body;

    try {

        const emailDatabase = await users.findOne({ email });
        if (!emailDatabase) {
            return res.status(404).send("Email inválido!");
        }

        const confirmPass = bcrypt.compareSync(password, emailDatabase.password);
        if (!confirmPass) {
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
};

export { signUp, signIn };