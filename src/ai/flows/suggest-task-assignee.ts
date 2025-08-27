// This is a server-side file, mark it as such.
'use server';

/**
 * @fileOverview AI-powered task assignee suggestion flow.
 *
 * This file defines a Genkit flow that suggests the best assignee for a task
 * based on their current workload and expertise.
 *
 * - suggestTaskAssignee - The main function to trigger the task assignee suggestion flow.
 * - SuggestTaskAssigneeInput - The input type for the suggestTaskAssignee function.
 * - SuggestTaskAssigneeOutput - The output type for the suggestTaskAssignee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow.
const SuggestTaskAssigneeInputSchema = z.object({
  taskDescription: z
    .string() 
    .describe('A detailed description of the task that needs to be assigned.'),
  teamMembers: z
    .array(z.object({
      name: z.string().describe('The name of the team member.'),
      expertise: z.string().describe('A brief description of the team member\'s expertise.'),
      currentWorkload: z
        .number()
        .describe('A numerical value representing the team member\'s current workload (e.g., number of open tasks).'),
    }))
    .describe('An array of team members with their expertise and current workload.'),
});

export type SuggestTaskAssigneeInput = z.infer<typeof SuggestTaskAssigneeInputSchema>;

// Define the output schema for the flow.
const SuggestTaskAssigneeOutputSchema = z.object({
  suggestedAssignee: z.string().describe('The name of the suggested assignee for the task.'),
  reason: z.string().describe('The reasoning behind the assignee suggestion.'),
});

export type SuggestTaskAssigneeOutput = z.infer<typeof SuggestTaskAssigneeOutputSchema>;

// Exported function to call the flow
export async function suggestTaskAssignee(input: SuggestTaskAssigneeInput): Promise<SuggestTaskAssigneeOutput> {
  return suggestTaskAssigneeFlow(input);
}

// Define the prompt
const suggestTaskAssigneePrompt = ai.definePrompt({
  name: 'suggestTaskAssigneePrompt',
  input: {schema: SuggestTaskAssigneeInputSchema},
  output: {schema: SuggestTaskAssigneeOutputSchema},
  prompt: `You are an AI assistant helping project managers assign tasks to team members.

Given the following task description and a list of team members with their expertise and current workload, suggest the best assignee for the task.

Task Description: {{{taskDescription}}}

Team Members:
{{#each teamMembers}}
- Name: {{name}}, Expertise: {{expertise}}, Workload: {{currentWorkload}}
{{/each}}

Consider both expertise and workload when making your suggestion.  The team member should have the skillset to complete the task, but should also have sufficient time to complete the task in a timely manner.

Output the suggested assignee's name and a brief explanation of your reasoning.  Consider listing the pros/cons of other possible assignees.`,
});

// Define the flow
const suggestTaskAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestTaskAssigneeFlow',
    inputSchema: SuggestTaskAssigneeInputSchema,
    outputSchema: SuggestTaskAssigneeOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskAssigneePrompt(input);
    return output!;
  }
);
