import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './Routes/userRoutes.js'
import adminRoutes from './Routes/adminRoutes.js'
import postRoutes from './Routes/postRoutes.js'
import chefRoutes from './Routes/chefRoutes.js'
import userClient from './Routes/userClientRoute.js'
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import bidRoutes from './Routes/bidRoutes.js'


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();
const corsOptions = {
    origin:process.env.CLIENT_URL,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true
}
app.use(cors(corsOptions))


app.use(cookieParser())
app.use('/api/users',userRoutes)
app.use('/api/admin', adminRoutes);

app.use('/api/chefs',chefRoutes)
app.use('/api/posts', postRoutes);
app.use('/api/userclient',userClient)
app.use('/api/bids',bidRoutes)
app.use(errorHandler)

app.listen(5000, () => {
  console.log('Server running on port 5000');
});