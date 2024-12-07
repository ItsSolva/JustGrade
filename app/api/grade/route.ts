// app/api/grade/route.ts
import { IncomingForm } from 'formidable';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,  // Disable the body parser to allow formidable to handle file parsing
  },
};

export async function POST(req: Request) {
  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {  // Use 'any' for compatibility
      if (err) {
        return reject(new NextResponse('Error parsing form data', { status: 500 }));
      }

      // Simulate grading logic or replace with AI logic here
      const results = [
        { studentId: '123', name: 'John Doe', grade: 'A', feedback: 'Great!' },
        { studentId: '124', name: 'Jane Smith', grade: 'B', feedback: 'Good work!' },
      ];

      resolve(new NextResponse(JSON.stringify(results), { status: 200 }));
    });
  });
}
