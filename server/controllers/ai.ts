import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const FALLBACK_SAMPLES: Record<string, string[]> = {
  retail: [
    "Prompt customer support and polite staff at the front desk. The billing process was smooth and hassle-free, with clear product warranty explanation.",
    "Well-organized display counters and clean ambience. Team members answered all technical queries patiently. Great simulated benchmark.",
    "Swift checkout experience and courteous assistance. All items were neatly packed and receipts were verified accurately."
  ],
  hospitality: [
    "Warm welcome at the reception and clean seating arrangements. Dining service was attentive and food presentation was top-notch.",
    "Comfortable ambience with quiet background acoustics. Staff ensured regular check-ins on our table without being intrusive.",
    "Efficient room turnover and helpful concierge staff. Very pleasant educational hospitality simulation experience."
  ],
  digital: [
    "Impressive responsiveness on creative brief inquiries. Communication was clear, timely, and milestones were accurately charted.",
    "Structured project presentation deck with transparent deliverable timelines. Demonstrates high agency standard in simulation test.",
    "Prompt technical consultation and proactive recommendations on website layout performance and user experience."
  ]
};

export async function generateSampleComment(req: Request, res: Response) {
  try {
    const { business_name, business_type, context_notes } = req.body;
    const business = business_name || 'ABC Enterprises';
    const type = business_type || 'retail';

    let generatedText = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        if (!aiClient) {
          aiClient = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });
        }

        const prompt = `You are an educational writing tutor generating an objective, realistic sample customer feedback comment for an educational simulation exercise called "RITAM REVIEW AGENCY".
Business Name: ${business}
Business Category: ${type}
Context: ${context_notes || 'General customer experience evaluation'}

Guidelines:
1. Write 2-3 sentences of balanced, constructive, realistic educational sample feedback.
2. Focus on aspects like staff courtesy, facility cleanliness, response time, or checkout efficiency.
3. Output ONLY the sample text. No preamble or quotes.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        generatedText = response.text?.trim() || '';
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using fallback templates:', geminiErr);
      }
    }

    if (!generatedText) {
      // Pick a smart template
      const category = type.toLowerCase().includes('hotel') || type.toLowerCase().includes('restaurant')
        ? 'hospitality'
        : type.toLowerCase().includes('tech') || type.toLowerCase().includes('digital')
        ? 'digital'
        : 'retail';
      const pool = FALLBACK_SAMPLES[category] || FALLBACK_SAMPLES.retail;
      const randomIndex = Math.floor(Math.random() * pool.length);
      generatedText = pool[randomIndex].replace(/ABC Enterprises/g, business);
    }

    return res.json({
      success: true,
      sample_comment: generatedText,
      disclaimer: 'SIMULATED SAMPLE — NOT FOR REAL-WORLD POSTING',
      business_name: business
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate sample comment.' });
  }
}
