import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './Routes/userRoutes.js'

dotenv.config();

const app = express();

app.use(express.json());


connectDB();
const corsOptions = {
    origin:process.env.CLIENT_URL,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true
}
app.use(cors(corsOptions))

app.use('/api/users',userRoutes)

app.listen(5000, () => {
  console.log('Server running on port 5000');
});