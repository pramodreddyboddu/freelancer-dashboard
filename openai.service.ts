import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-api-key', // Use environment variable in production
});

export interface GigDetails {
  projectType: string;
  budget: number;
  timeline: string;
  platform: string;
  additionalInfo?: string;
}

export const generatePitch = async (skills: string[], gigDetails: GigDetails): Promise<string> => {
  try {
    // Construct the prompt for OpenAI
    const prompt = `
Generate a professional freelance pitch for a ${gigDetails.projectType} project with a budget of $${gigDetails.budget}.

Skills: ${skills.join(', ')}
Timeline: ${gigDetails.timeline}
Platform: ${gigDetails.platform}
${gigDetails.additionalInfo ? `Additional Information: ${gigDetails.additionalInfo}` : ''}

The pitch should be concise, professional, and highlight relevant experience and skills. It should be tailored for the ${gigDetails.platform} platform and follow best practices for freelance proposals.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use appropriate model
      messages: [
        {
          role: "system",
          content: "You are an expert freelance pitch writer who creates compelling, personalized pitches for freelancers to help them win projects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract and return the generated pitch
    return response.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a pitch at this time. Please try again later.";
  } catch (error) {
    console.error('Error generating pitch with OpenAI:', error);
    throw new Error('Failed to generate pitch. Please try again later.');
  }
};

export default openai;
