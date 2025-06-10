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

import notificationRoutes from './Routes/notificationRoutes.js'
import http from 'http'
import { initSocket } from './socket.js';

import profileRoutes from './Routes/profileRoutes.js'
import uploadRoutes from './Routes/fileUploadRoutes.js'
import paymentRoutes from './Routes/paymentRoutes.js'
import walletRoutes from './Routes/walletRoutes.js'

import deliveryRoutes from './Routes/deliveryBoyRoutes.js'

import messageRoutes from './Routes/messageRoutes.js'

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());


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

app.use('/api/notifications',notificationRoutes)

app.use('/api/certificates',uploadRoutes)
// app.use('/api/deliveryBoy',uploadRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/wallet',walletRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/delivery',deliveryRoutes)
app.use('/api/messages', messageRoutes);
app.use(errorHandler)

initSocket(server, process.env.CLIENT_URL);

server.listen(5000, () => {
  console.log('Server running on port 5000');
});