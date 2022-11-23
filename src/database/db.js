import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect();
db = mongoClient.db("bbs");

export const users = db.collection('users');
export const sessions = db.collection('sessions');
/* const products = db.collection('products'); */