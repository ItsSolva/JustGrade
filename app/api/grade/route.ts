import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is properly configured
});

export async function POST(req: NextRequest) {
  try {
    const { fileContent, rubricContent } = await req.json();

    if (!fileContent) {
      return NextResponse.json({ error: "File content is missing" }, { status: 400 });
    }

    // Construct prompt
    const prompt = `
      You are a teacher grading the following assignment. 
      Provide a grade (1.0 upto 10.0) and feedback (write it in dutch), make sure the grade and feeback are both on its own line:
      The following is the rubric or a good example:
      ${rubricContent}
      -----
      ${fileContent}
      -----
      Respond with "Grade: [score], Feedback: [feedback]"
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const result = aiResponse.choices[0]?.message?.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in /api/grade:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
