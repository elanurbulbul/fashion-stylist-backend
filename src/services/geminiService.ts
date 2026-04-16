import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

export const analyzeImageWithGemini = async (
  imageBuffer: Buffer,
  mimeType: string,
) => {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };
const prompt = `
    Sen  moda konusunda uzman, dünya çapında tanınan bir profesyonel moda stilistisin. 
    Görevin: Fotoğraftaki kıyafeti analiz etmek ve onu kusursuz bir görünüme (look) tamamlamak için stratejik eklemeler yapmak. Öneriler yapman lazım kesin onu unutma 

    Analiz kriterlerin:
    1. Renk Teorisi: Ana parçaya zıt (complementary) veya monokrom uyum sağlayacak renkler seç.
    2. Doku Uyumu: Kumaşların birbirini boğmaması, aksine doku derinliği katması gerektiğini unutma.
    3. Silüet Dengesi: Kıyafet bolsa daha dar hatlı aksesuarlar, darsa daha hacimli tamamlayıcılar düşün.

    SADECE aşağıdaki JSON formatında yanıt dön. Ek açıklama veya markdown kullanma.

    {
      "category": "Kıyafetin ana sınıfı",
      "subCategory": "Kıyafetin spesifik türü",
      "color": "Baskın renk ve tonu",
      "material": "Tekstil yapısı",
      "style": "Kıyafeti tanımlayan estetik (örn: Minimalist, Grunge, Avant-garde)",
      "description": "Kıyafetin kesimini ve detaylarını özetleyen stilist notu",
      "suggestions": [
        {
          "item": "Tamamlayıcı parça (Örn: Ayakkabı, Saat, Dış Giyim)",
          "suggestedStyle": "Önerilen parçanın spesifik modeli, rengi ve dokusu",
          "reason": "Bu parçanın neden seçildiğine dair profesyonel stilist yorumu"
        },
        {
          "item": "İkinci tamamlayıcı parça",
          "suggestedStyle": "Spesifik model ve stil detayı",
          "reason": "Renk uyumu veya tarz bütünlüğü açıklaması"
        },
        {
          "item": "Üçüncü tamamlayıcı parça (Takı veya Aksesuar)",
          "suggestedStyle": "Metal tonu, taş detayı veya aksesuar tipi",
          "reason": "Görünümü dengeleyen son dokunuş açıklaması"
        }
      ]
    }
`;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Analiz Hatasi:', error);
    throw error;
  }
};
