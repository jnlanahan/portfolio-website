import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export interface PolishSuggestion {
  type: 'grammar' | 'clarity' | 'style' | 'tone' | 'structure' | 'engagement';
  original: string;
  improved: string;
  explanation: string;
  confidence: number; // 0-1 scale
  startIndex?: number;
  endIndex?: number;
}

export interface PolishResponse {
  suggestions: PolishSuggestion[];
  overallScore: number; // 0-100 scale
  summary: string;
  wordCount: number;
  readabilityScore: number;
}

/**
 * Analyzes content and provides writing improvement suggestions
 */
export async function polishContent(content: string, contentType: 'blog' | 'excerpt' | 'title' = 'blog'): Promise<PolishResponse> {
  try {
    // Strip HTML tags for analysis
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (!plainText || plainText.length < 10) {
      return {
        suggestions: [],
        overallScore: 50,
        summary: "Content too short for meaningful analysis",
        wordCount: plainText.split(/\s+/).length,
        readabilityScore: 50
      };
    }

    const systemPrompt = getSystemPrompt(contentType);
    const userPrompt = getUserPrompt(plainText, contentType);

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and format the response
    return {
      suggestions: (result.suggestions || []).map(formatSuggestion),
      overallScore: Math.max(0, Math.min(100, result.overallScore || 70)),
      summary: result.summary || "Content analysis completed",
      wordCount: plainText.split(/\s+/).length,
      readabilityScore: Math.max(0, Math.min(100, result.readabilityScore || 70))
    };

  } catch (error) {
    console.error('Error in AI content polishing:', error);
    throw new Error('Failed to analyze content. Please try again.');
  }
}

/**
 * Provides quick style suggestions for real-time feedback
 */
export async function getQuickSuggestions(content: string): Promise<string[]> {
  try {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (!plainText || plainText.length < 20) {
      return [];
    }

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a writing assistant. Provide 3-5 quick, actionable writing tips for the given text. 

IMPORTANT: Your tips must encourage natural, human-like writing. Avoid suggesting:
- Overused phrases like "Dive into," "It's important to note," "Certainly," "Navigating the complexities of"
- Excessive hedging language
- Generic blogging clichés
- Repetitive sentence structures
- Overly cautious language

Instead, encourage:
- Natural sentence variation
- Specific details and examples
- Authentic voice with personality
- Direct, confident statements
- Personal touches and relatable language

Respond with a JSON object containing a "tips" array of strings.`
        },
        {
          role: "user",
          content: `Analyze this text and provide quick improvement tips that will make it sound more natural and human: "${plainText.substring(0, 500)}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tips": []}');
    return Array.isArray(result.tips) ? result.tips : [];

  } catch (error) {
    console.error('Error getting quick suggestions:', error);
    return ['Consider varying your sentence length for better flow'];
  }
}

/**
 * Improves a specific text selection
 */
export async function improveSelection(selectedText: string, context: string = ''): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert editor. Improve the selected text while maintaining its meaning and tone. Make it more clear, engaging, and well-written.

CRITICAL: Your improved text must sound natural and human. Avoid:
- Overused phrases like "Dive into," "It's important to note," "Certainly," "Navigating the complexities of"
- Excessive hedging with "Typically," "More often than not," "Might be"
- Repetitive parallelism like "It's not about X, it's about Y"
- Generic, obvious content without specificity
- Overly cautious language that avoids definitive statements
- Blogging clichés and predictable structures

Instead, create text that:
- Varies sentence length naturally
- Includes specific details when possible
- Sounds authentic with personality
- Makes confident statements when appropriate
- Uses relatable, conversational language
- Flows naturally like human speech

Return only the improved text without explanations.`
        },
        {
          role: "user",
          content: `Improve this text to sound more natural and human: "${selectedText}"${context ? `\n\nContext: ${context.substring(0, 200)}` : ''}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0].message.content?.trim() || selectedText;

  } catch (error) {
    console.error('Error improving selection:', error);
    return selectedText;
  }
}

function getSystemPrompt(contentType: string): string {
  const basePrompt = `You are an expert writing coach and editor. Analyze the given text and provide specific, actionable suggestions to improve clarity, engagement, grammar, and style.

CRITICAL: Your suggestions must sound natural and human. Avoid these AI writing patterns:
- Overused phrases like "Dive into," "It's important to note," "Certainly," "Navigating the complexities of," "Delving into the intricacies of"
- Excessive hedging with "Typically," "More often than not," "Might be," "Don't always"
- Repetitive parallelism like "It's not about X, it's about Y"
- Overly long sentences of similar length
- Generic, obvious content without specificity
- Immediate lists without context
- Overly cautious language that avoids definitive statements
- Blogging clichés and predictable structures
- Consistent voice without natural variation

Instead, encourage:
- Natural sentence length variation
- Specific details and examples
- Authentic voice with personality
- Occasional imperfections that feel human
- Direct, confident statements when appropriate
- Personal touches and relatable language
- Creative transitions between ideas
- Natural flow that mirrors human speech patterns

Focus on:
1. Grammar and syntax errors
2. Clarity and readability improvements
3. Style and tone enhancements
4. Engagement and flow
5. Structure and organization

Respond with JSON in this exact format:
{
  "suggestions": [
    {
      "type": "grammar|clarity|style|tone|structure|engagement",
      "original": "exact text that needs improvement",
      "improved": "suggested improvement",
      "explanation": "brief explanation of why this is better",
      "confidence": 0.8
    }
  ],
  "overallScore": 85,
  "summary": "Brief overall assessment",
  "readabilityScore": 78
}`;

  const contentSpecific = {
    blog: "This is blog post content. Focus on engaging storytelling, clear structure, and reader engagement. Encourage personal voice and authentic human connection.",
    excerpt: "This is a blog post excerpt. Focus on compelling hooks and clear value proposition. Make it sound conversational and authentic.",
    title: "This is a blog post title. Focus on clarity, SEO, and engagement. Avoid generic patterns and colons unless truly necessary."
  };

  return `${basePrompt}\n\n${contentSpecific[contentType] || contentSpecific.blog}`;
}

function getUserPrompt(content: string, contentType: string): string {
  return `Please analyze this ${contentType} content and provide improvement suggestions:

"${content}"

Focus on making it more engaging, clear, and naturally human while maintaining the original voice and meaning. Identify and flag any AI-like patterns such as:
- Overused phrases like "Dive into," "It's important to note," "Certainly," "Navigating the complexities of"
- Excessive hedging language
- Repetitive sentence structures
- Generic, obvious content
- Overly cautious language
- Blogging clichés

Suggest improvements that create natural sentence variation, authentic voice, specific details, and conversational flow.`;
}

function formatSuggestion(suggestion: any): PolishSuggestion {
  return {
    type: ['grammar', 'clarity', 'style', 'tone', 'structure', 'engagement'].includes(suggestion.type) 
      ? suggestion.type : 'style',
    original: String(suggestion.original || ''),
    improved: String(suggestion.improved || ''),
    explanation: String(suggestion.explanation || ''),
    confidence: Math.max(0, Math.min(1, Number(suggestion.confidence) || 0.7))
  };
}

/**
 * Calculates basic readability metrics
 */
export function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  // Simplified Flesch Reading Ease formula
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  // Convert to 0-100 scale where higher is better
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;
  
  if (word.endsWith('e')) count--;
  if (word.endsWith('le')) count++;
  
  return Math.max(1, count);
}