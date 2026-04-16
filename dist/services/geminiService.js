"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageWithGemini = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const analyzeImageWithGemini = async (imageBuffer, mimeType) => {
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
    }
    catch (error) {
        console.error('Gemini Analiz Hatasi:', error);
        throw error;
    }
};
exports.analyzeImageWithGemini = analyzeImageWithGemini;
//# sourceMappingURL=geminiService.js.map