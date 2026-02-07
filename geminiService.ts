
import { GoogleGenAI } from "@google/genai";
import { ToneType } from "./types";

export const adjustThaiTone = async (text: string, tone: ToneType, scenario?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านภาษาไทยและการปรับโทนการสื่อสาร (Copywriting Expert). 
หน้าที่ของคุณคือรับข้อความจากผู้ใช้และปรับเปลี่ยนโทน (Tone of Voice) ให้ตรงตามที่กำหนด โดยที่ยังคงรักษา "เนื้อหาสำคัญ" และ "จุดประสงค์เดิม" ของข้อความไว้อย่างครบถ้วน. 
โปรดพิจารณา "สถานการณ์" หรือ "บริบท" ที่ผู้ใช้ระบุมาด้วยเพื่อให้เลือกใช้คำศัพท์และระดับภาษาที่เหมาะสมที่สุด
โปรดตอบกลับเฉพาะข้อความที่ปรับปรุงแล้วเท่านั้น ไม่ต้องมีคำเกริ่นนำหรือคำอธิบายเพิ่มเติม`;

  const tonePrompts: Record<ToneType, string> = {
    professional: "ปรับให้เป็นภาษาทางการ (Formal) เหมาะสำหรับการสื่อสารในที่ทำงาน หรือเอกสารทางราชการ",
    polite: "ปรับให้เป็นภาษาสุภาพ (Polite) ใช้คำลงท้ายที่เหมาะสม เช่น 'ครับ/ค่ะ' และใช้คำสรรพนามที่สุภาพ",
    casual: "ปรับให้เป็นภาษาเป็นกันเอง (Casual) เหมือนคุยกับเพื่อนร่วมงานที่สนิท แต่ยังคงความชัดเจน",
    friendly: "ปรับให้มีโทนที่อบอุ่นและเป็นมิตร (Friendly) เน้นการสร้างความรู้สึกที่ดี",
    persuasive: "ปรับให้มีพลังในการโน้มน้าวใจ (Persuasive) เหมาะสำหรับการเชิญชวนหรือการขาย",
    humorous: "ปรับให้ดูสนุกสนาน มีอารมณ์ขัน (Humorous) และมีความคิดสร้างสรรค์",
    urgent: "ปรับให้กระชับ ได้ใจความ และสื่อถึงความจำเป็นที่ต้องดำเนินการทันที (Urgent)"
  };

  const contextPart = scenario ? `สถานการณ์/บริบท: "${scenario}"\n` : "";

  const prompt = `
${contextPart}
ข้อความที่ต้องการปรับ: 
"${text}"

โทนที่ต้องการ: ${tonePrompts[tone]}

โปรดแสดงข้อความที่ปรับแล้วในภาษาไทย:
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const result = response.text;
    if (!result) throw new Error("No response from AI");
    
    return result.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
