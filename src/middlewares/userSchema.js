import { userSchema } from "../app.js";
export function userSchemaValidation (req ,res, next){
    const formNewUser = req.body;
    const validationUser = userSchema.validate(formNewUser, { abortEarly: false });
    if (validationUser.error) {
        const errors = validationUser.error.details.map(fail => fail.message);
        return res.status(401).send(errors)
    };
    next();
}