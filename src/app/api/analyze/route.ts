import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this civic issue image and return a JSON object with the following fields:
    - category (String: Broken Live Electric Wire, Deep Pothole / Damaged Road, Open Manhole / Missing Cover, Uncollected Garbage & Illegal Dumping, Streetlight Outage / Dark Alley, Sewerage Overflow / Pipeline Leakage, Fallen Tree / Danger Branch, Waterlogging & Mosquito Breeding, Traffic Signal Fault, Footpath Encroachment, Fire & Emergency Hazard, or Other)
    - severity (String: Low, Medium, High, Critical)
    - summary (String: One-line short description of the issue)
    - department (String: Electrical & Power Services, Roads & Traffic Infrastructure, Water Supply & Drainage, Sanitation & Waste Management, Public Health & Disease Control, Parks & Horticulture, Building Enforcement & Planning, Fire & Emergency Hazards, General Municipal Services)
    - confidence (Number: 0-100)
    
    Only return raw JSON format without markdown ticks or other text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: imageBase64.substring(5, imageBase64.indexOf(';')),
        },
      },
    ]);

    const responseText = result.response.text();
    // Parse the JSON output
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
