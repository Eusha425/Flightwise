// src/ai/flows/price-history.ts
'use server';

/**
 * @fileOverview Visualizes historical flight price data for a given route.
 *
 * - getPriceHistory - A function that handles the price history retrieval process.
 * - PriceHistoryInput - The input type for the getPriceHistory function.
 * - PriceHistoryOutput - The return type for the getPriceHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PriceHistoryInputSchema = z.object({
  route: z.string().describe('The flight route (e.g., JFK-LHR).'),
});
export type PriceHistoryInput = z.infer<typeof PriceHistoryInputSchema>;

const PriceHistoryOutputSchema = z.object({
    isValidRoute: z.boolean().describe('Whether the provided route has historical data.'),
    prices: z.array(z.object({
        date: z.string().describe('The date of the price point (YYYY-MM-DD).'),
        price: z.number().describe('The average price on that date.'),
    })).optional().describe('A list of historical price points for the last 90 days.'),
});
export type PriceHistoryOutput = z.infer<typeof PriceHistoryOutputSchema>;

export async function getPriceHistory(input: PriceHistoryInput): Promise<PriceHistoryOutput> {
  return priceHistoryFlow(input);
}

const PriceHistoryPromptInputSchema = z.object({
    route: z.string().describe('The flight route (e.g., JFK-LHR).'),
    currentDate: z.string().describe("Today's date in YYYY-MM-DD format.")
});

const prompt = ai.definePrompt({
  name: 'priceHistoryPrompt',
  input: {schema: PriceHistoryPromptInputSchema},
  output: {schema: PriceHistoryOutputSchema},
  prompt: `You are an expert flight price analyst. Your task is to provide a plausible set of historical price data for a given flight route based on your knowledge of airline pricing.

  Today's date is {{currentDate}}.

  For the flight route '{{{route}}}', please do the following:
  1.  First, determine if the route is a real, valid flight route.
  2.  If the route is valid, generate a list of daily average prices for the last 90 days, ending today. The data should reflect typical price fluctuations due to demand, time of week, and other factors. Provide a price for each of the 90 days.
  3.  If the route is invalid or you have no data for it, you must set 'isValidRoute' to false and the 'prices' array should be empty.

  Please provide the response in the structured JSON format defined by the output schema.
  
  Route: {{{route}}}`,
});

const priceHistoryFlow = ai.defineFlow(
  {
    name: 'priceHistoryFlow',
    inputSchema: PriceHistoryInputSchema,
    outputSchema: PriceHistoryOutputSchema,
  },
  async (input) => {
    // Add today's date to the prompt context.
    const currentDate = new Date().toISOString().split('T')[0];
    const {output} = await prompt({ route: input.route, currentDate });
    
    if (!output) {
        return { isValidRoute: false };
    }

    // If the model claims the route is valid but provides no prices,
    // we override it to be invalid to give the user proper feedback.
    if (output.isValidRoute && (!output.prices || output.prices.length === 0)) {
        return { isValidRoute: false };
    }

    return output;
  }
);
