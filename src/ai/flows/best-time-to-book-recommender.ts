// src/ai/flows/best-time-to-book-recommender.ts
'use server';

/**
 * @fileOverview Recommends the best time to book a flight for a given route and date using AI knowledge.
 *
 * - bestTimeToBookRecommender - A function that handles the recommendation process.
 */

import {ai} from '@/ai/genkit';
import { 
    BestTimeToBookRecommenderInputSchema, 
    BestTimeToBookRecommenderOutputSchema,
    type BestTimeToBookRecommenderInput,
    type BestTimeToBookRecommenderOutput
} from '@/ai/types';

export async function bestTimeToBookRecommender(
  input: BestTimeToBookRecommenderInput
): Promise<BestTimeToBookRecommenderOutput> {
  return bestTimeToBookRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bestTimeToBookPrompt',
  input: {schema: BestTimeToBookRecommenderInputSchema},
  output: {schema: BestTimeToBookRecommenderOutputSchema},
  system: `You are an expert travel consultant. Your goal is to recommend the best time to book a flight. 
Analyze the user's provided route and departure date to give a recommendation based on your knowledge of travel trends, seasonality, and common booking patterns. 
For example: "For a summer flight to Europe, it's best to book 3-5 months in advance. I recommend booking soon. Confidence: High." or "Flights to Southeast Asia during the monsoon season can be cheaper if you book closer to the date, but availability might be limited. I'd suggest waiting a few weeks. Confidence: Medium."
Formulate your final answer into the required JSON format.`,
  prompt: `Recommend the best time to book for a flight on route {{{route}}} for departure date {{{departureDate}}}.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const bestTimeToBookRecommenderFlow = ai.defineFlow(
  {
    name: 'bestTimeToBookRecommenderFlow',
    inputSchema: BestTimeToBookRecommenderInputSchema,
    outputSchema: BestTimeToBookRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
