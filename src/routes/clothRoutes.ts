import express, { type Request, type Response } from 'express';
import { uploadMiddleware, uploadToS3 } from '../services/uploadService';

const router = express.Router();

router.post('/upload', uploadMiddleware, async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Lutfen bir dosya secin.' });
  }

  try {
    const s3Key = await uploadToS3(req.file);

    return res.status(200).json({
      success: true,
      message: 'Fotograf basariyla yuklendi.',
      data: { s3Key },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';

    return res.status(500).json({ success: false, message });
  }
});

export default router;
