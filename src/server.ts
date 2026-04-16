import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import clothRoutes from './routes/clothRoutes';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' })); 

connectDB();

app.get('/', (_req: Request, res: Response) => {
  res.send('Fashion Stylist API calisiyor!');
});

app.use('/api/cloths', clothRoutes);


app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde calisiyor.`);
});
