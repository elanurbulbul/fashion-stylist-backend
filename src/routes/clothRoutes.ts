import express from 'express';
import { uploadMiddleware, uploadToS3 } from '../services/uploadService';
import { analyzeImageWithGemini } from '../services/geminiService';
import Cloth from '../models/Cloth';

const router = express.Router();

const extractJsonObject = (rawText: string) => {
  const fencedMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return rawText.slice(firstBrace, lastBrace + 1).trim();
  }

  throw new SyntaxError('Gemini gecerli bir JSON nesnesi dondurmedi.');
};

const mapAnalyzeError = (error: unknown) => {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: number }).status)
      : undefined;

  if (error instanceof SyntaxError) {
    return {
      status: 502,
      message: 'Gemini yaniti JSON formatinda gelmedi. Lutfen tekrar deneyin.',
    };
  }

  if (status === 400) {
    return {
      status: 400,
      message: 'Gemini istegi gecersiz. API key ve model ayarlarini kontrol edin.',
    };
  }

  if (status === 404) {
    return {
      status: 502,
      message: 'Gemini modeli bulunamadi. GEMINI_MODEL degerini guncelleyin.',
    };
  }

  if (status === 429) {
    return {
      status: 429,
      message: 'Gemini kotasi dolu. Biraz sonra tekrar deneyin.',
    };
  }

  return {
    status: 500,
    message: 'Yapay zeka analiz yaparken bir sorun olustu.',
  };
};

router.post('/upload', uploadMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Lutfen bir dosya secin.',
    });
  }

  try {
    const s3Key = await uploadToS3(req.file);
    const analysisRaw = await analyzeImageWithGemini(
      req.file.buffer,
      req.file.mimetype,
    );

    const analysisJson = extractJsonObject(analysisRaw);
    const analysis = JSON.parse(analysisJson);
    const suggestions = Array.isArray(analysis.suggestions)
      ? analysis.suggestions
          .map((suggestion: unknown) => {
            if (typeof suggestion !== 'object' || suggestion === null) {
              return null;
            }

            const item =
              'item' in suggestion && typeof suggestion.item === 'string'
                ? suggestion.item.trim()
                : '';
            const suggestedStyle =
              'suggestedStyle' in suggestion &&
              typeof suggestion.suggestedStyle === 'string'
                ? suggestion.suggestedStyle.trim()
                : '';
            const reason =
              'reason' in suggestion && typeof suggestion.reason === 'string'
                ? suggestion.reason.trim()
                : '';

            if (!item && !suggestedStyle && !reason) {
              return null;
            }

            return {
              item,
              suggestedStyle,
              reason,
            };
          })
          .filter(Boolean)
      : [];

    const newCloth = new Cloth({
      s3Key,
      category: analysis.category,
      subCategory: analysis.subCategory,
      color: analysis.color,
      material: analysis.material,
      style: analysis.style,
      description: analysis.description,
      suggestions,
    });

    await newCloth.save();

    return res.status(200).json({
      success: true,
      message: 'Kiyafet kaydedildi ve analiz edildi.',
      data: newCloth,
    });
  } catch (error: unknown) {
    console.error('Yukleme veya Analiz Hatasi:', error);

    const { status, message } = mapAnalyzeError(error);

    return res.status(status).json({
      success: false,
      message,
    });
  }
});

router.get('/', async (_req, res) => {
  try {
    const cloths = await Cloth.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: cloths,
    });
  } catch (error: unknown) {
    console.error('Kiyafet listeleme hatasi:', error);

    return res.status(500).json({
      success: false,
      message: 'Kiyafetler listelenirken bir sorun olustu.',
    });
  }
});

export default router;
