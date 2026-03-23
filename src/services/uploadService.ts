// src/services/uploadService.ts
import multer from 'multer';
import { s3Client, BUCKET_NAME } from '../config/s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid'; 
import e from 'express';

// 1. Multer Hafıza Depolama (Dosyayı RAM'de tutar, diske yazmaz)
const storage = multer.memoryStorage();

// 2. Sadece Görüntü Dosyalarına İzin Ver (Güvenlik)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece görüntü dosyaları yüklenebilir!!!!'), false);
  }
};

// Multer Middleware'i Oluştur (Tek dosya, alan adı "image")
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 5MB
}).single('image');

// 3. S3'e Yükleme Fonksiyonu
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`; // Benzersiz dosya adı

  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: `cloths/${fileName}`, // "cloths" klasörüne yükle
        Body: file.buffer, // Dosya verisi
        ContentType: file.mimetype, // Dosya türü
        // ACL: 'public-read', // Eğer bucket public ise bunu açabilirsin (Dikkat!)
      },
    });

    const result = await parallelUploads3.done();
    console.log(`Dosya S3'e yüklendi: Key=${result.Key}`);

    // Yüklenen dosyanın URL'ini döndür (Eğer public ise)
    // return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/cloths/${fileName}`;

    // Veya sadece Key'i döndür (Veritabanına kaydetmek için en iyisi)
    return result.Key!;
  } catch (error) {
    console.error('S3e yükleme hatası:', error);
    throw new Error('Dosya sunucuya yüklenirken bir hata oluştu.');
  }
};