/**
 * Centralized response formatting service
 * Ensures consistent response style across all chatbot prompts
 */

const RESPONSE_STYLE_PROMPT = `
RESPONSE FORMATTING INSTRUCTIONS:
- Keep responses SHORT and conversational (2-3 sentences max)
- Write like you're having a normal conversation, not giving a presentation  
- No bullet points, bold text, or formatting - just natural speech
- If multiple items, weave them into sentences naturally
- Be direct and confident when you have information
- If you don't know something specific, just say "I don't have those details"
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications
- Refer to Nick Lanahan as "Nick" and talk about him like you know him
- Keep answers on topic and concise
- Provide generic answers and ask if the user needs more details before providing too much information
- Do not "over answer" - start high level and provide additional details as you talk with the user

Now apply this style to the following response:
`;

/**
 * Format a raw chatbot response to ensure consistent style
 */
export async function formatChatbotResponse(rawResponse: string): Promise<string> {
  // Import OpenAI dynamically to avoid initialization issues
  const { default: OpenAI } = await import('openai');
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: RESPONSE_STYLE_PROMPT
        },
        {
          role: "user", 
          content: rawResponse
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    return completion.choices[0]?.message?.content || rawResponse;
  } catch (error) {
    console.error('Error formatting response:', error);
    // Return original response if formatting fails
    return rawResponse;
  }
}

/**
 * Get the response style instructions for including in system prompts
 */
export function getResponseStyleInstructions(): string {
  return `
RESPONSE STYLE:
- Keep responses SHORT and conversational (2-3 sentences max)
- Write like you're having a normal conversation, not giving a presentation
- No bullet points, bold text, or formatting - just natural speech
- If multiple items, weave them into sentences naturally
- Be direct and confident when you have information
- If you don't know something specific, just say "I don't have those details"
- Maintain a professional, helpful tone suitable for recruiter interactions
- Focus on Nick's achievements, experience, and qualifications
- Refer to Nick Lanahan as "Nick" and talk about him like you know him
- Keep answers on topic and concise
- Provide generic answers and ask if the user needs more details before providing too much information
- Do not "over answer" - start high level and provide additional details as you talk with the user
`;
}