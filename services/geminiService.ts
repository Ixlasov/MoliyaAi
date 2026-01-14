
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Transaction, Person } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Siz "Moliya AI" shaxsiy yordamchisiz. Foydalanuvchi xabarlarini tahlil qilib JSON qaytaring.

DIQQAT QILISH KERAK BO'LGAN QOIDALAR:
1. **Qarz turlari**:
   - "Berdim" (masalan: "Aliyevga 100 ming berdim") -> intent: "debt", type: "Qarz Berdim".
   - "Oldim" (masalan: "Aliyevdan 100 ming oldim") -> intent: "debt", type: "Qarz Oldim".
2. **Kategoriyalar**: Xarajatlar uchun (Ovqat, Yo'l, Kommunal va h.k.), Daromadlar uchun (Oylik, Sovg'a va h.k.) aniqlang.
3. **To'lov turi**: Agar "Karta" yoki "Naqd" so'zi bo'lsa aniqlang. Yo'q bo'lsa, 'needsClarification' maydoniga 'paymentMethod' deb yozing.
4. **Odamlar**: Ismlarni aniqlang. Agar ism bo'lsa intent doim 'debt' bo'ladi.
5. **Javob**: 'message' maydonida foydalanuvchiga nima tushunilganini chiroyli yozing.

JSON formati:
{
  "intent": "transaction" | "debt" | "clarification",
  "amount": number,
  "type": "Xarajat" | "Daromad" | "Qarz Berdim" | "Qarz Oldim",
  "category": string,
  "paymentMethod": "Karta" | "Naqd" | null,
  "personName": string | null,
  "message": string,
  "needsClarification": "paymentMethod" | null
}
`;

export const analyzeInput = async (input: string, context: { existingPeople: string[] }): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Foydalanuvchi: "${input}". Mavjud odamlar: ${context.existingPeople.join(", ")}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING },
            category: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            personName: { type: Type.STRING },
            message: { type: Type.STRING },
            needsClarification: { type: Type.STRING }
          },
          required: ["intent", "message"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AIResponse;
  } catch (error) {
    return {
      intent: 'clarification',
      message: "Tushunishda xatolik bo'ldi, iltimos aniqroq yozing."
    };
  }
};

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  try {
    const summary = transactions.slice(-5).map(t => `${t.type}: ${t.amount}`).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tranzaksiyalar: ${summary}. Qisqa maslahat.`,
      config: { systemInstruction: "Siz moliyachi yordamchisiz. O'zbek tilida 1 gaplik maslahat bering." }
    });
    return response.text || "Xarajatlarni nazorat qiling.";
  } catch {
    return "Moliya - baraka asosi!";
  }
};
