'use server';
/**
 * @fileOverview AI-powered task description generation flow.
 *
 * This file defines a Genkit flow that generates a detailed task description
 * based on a short user prompt.
 *
 * - generateTaskDescription - The main function to trigger the generation flow.
 * - GenerateTaskDescriptionInput - The input type for the generateTaskDescription function.
 * - GenerateTaskDescriptionOutput - The output type for the generateTaskDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow.
const GenerateTaskDescriptionInputSchema = z.object({
  prompt: z.string().describe('A short prompt or a few keywords about the task.'),
});
export type GenerateTaskDescriptionInput = z.infer<typeof GenerateTaskDescriptionInputSchema>;

// Define the output schema for the flow.
const GenerateTaskDescriptionOutputSchema = z.object({
  description: z.string().describe('The detailed, AI-generated task description.'),
});
export type GenerateTaskDescriptionOutput = z.infer<typeof GenerateTaskDescriptionOutputSchema>;


// Exported function to call the flow
export async function generateTaskDescription(input: GenerateTaskDescriptionInput): Promise<GenerateTaskDescriptionOutput> {
  return generateTaskDescriptionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateTaskDescriptionPrompt',
  input: {schema: GenerateTaskDescriptionInputSchema},
  output: {schema: GenerateTaskDescriptionOutputSchema},
  prompt: `You are an expert project manager. Based on the following user prompt, generate a clear, concise, and actionable task description.

The description should be structured and easy to understand. Consider breaking it down into sections like "Goal", "Requirements", or "Acceptance Criteria" if applicable.

User Prompt: {{{prompt}}}

Generate the task description.`,
});


const generateTaskDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTaskDescriptionFlow',
    inputSchema: GenerateTaskDescriptionInputSchema,
    outputSchema: GenerateTaskDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
