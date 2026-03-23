import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (_req: Request, res: Response) => {
  res.send('Fashion Stylist API calisiyor!');
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde calisiyor.`);
});
