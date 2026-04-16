"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = exports.uploadMiddleware = void 0;
// src/services/uploadService.ts
const multer_1 = __importDefault(require("multer"));
const s3_1 = require("../config/s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const uuid_1 = require("uuid");
// 1. Multer Hafıza Depolama (Dosyayı RAM'de tutar, diske yazmaz)
const storage = multer_1.default.memoryStorage();
// 2. Sadece Görüntü Dosyalarına İzin Ver (Güvenlik)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Sadece görüntü dosyaları yüklenebilir!!!!'), false);
    }
};
// Multer Middleware'i Oluştur (Tek dosya, alan adı "image")
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 5MB
}).single('image');
// 3. S3'e Yükleme Fonksiyonu
const uploadToS3 = async (file) => {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`; // Benzersiz dosya adı
    try {
        const parallelUploads3 = new lib_storage_1.Upload({
            client: s3_1.s3Client,
            params: {
                Bucket: s3_1.BUCKET_NAME,
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
        return result.Key;
    }
    catch (error) {
        console.error('S3e yükleme hatası:', error);
        throw new Error('Dosya sunucuya yüklenirken bir hata oluştu.');
    }
};
exports.uploadToS3 = uploadToS3;
//# sourceMappingURL=uploadService.js.map