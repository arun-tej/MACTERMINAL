import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: body.messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return new Response(
      JSON.stringify({
        message: completion.choices[0].message.content,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Check if it's a rate limit or quota exceeded error
    const isQuotaExceeded = 
      error instanceof Error && 
      (error.message.includes('quota') || 
       error.message.includes('rate limit') ||
       (error as any)?.code === 'insufficient_quota');
    
    return new Response(
      JSON.stringify({
        message: isQuotaExceeded 
          ? "I'm currently unavailable due to API usage limits. Please try again later or contact me directly at agnolas1@asu.edu."
          : "I'm having trouble processing that. Please email me at agnolas1@asu.edu",
      }),
      {
        status: 200, // Return 200 even for errors to handle them gracefully on the client
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
