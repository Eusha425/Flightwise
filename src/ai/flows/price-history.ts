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
    })).optional().describe('A list of historical price points.'),
});
export type PriceHistoryOutput = z.infer<typeof PriceHistoryOutputSchema>;

export async function getPriceHistory(input: PriceHistoryInput): Promise<PriceHistoryOutput> {
  return priceHistoryFlow(input);
}

const getHistoricalPricesForRoute = ai.defineTool({
    name: 'getHistoricalPricesForRoute',
    description: 'Retrieves historical price data for a given flight route.',
    inputSchema: z.object({
      route: z.string().describe('The flight route (e.g., JFK-LHR).'),
    }),
    outputSchema: z.object({
        isValidRoute: z.boolean(),
        prices: z.array(z.object({
            date: z.string(),
            price: z.number(),
        })).optional(),
    }),
  }, async ({ route }) => {
    // Placeholder data
    if (['JFK-LHR', 'SYD-LAX', 'SYD-SIN-LHR'].includes(route.toUpperCase())) {
        const prices = [];
        const today = new Date();
        for (let i = 90; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const basePrice = route.toUpperCase() === 'JFK-LHR' ? 600 : 1100;
            const price = basePrice + Math.sin(i / 10) * 100 + Math.random() * 50 - 25;
            prices.push({
                date: date.toISOString().split('T')[0],
                price: Math.round(price),
            });
        }
      return { isValidRoute: true, prices };
    }
    return { isValidRoute: false };
  }
);


const prompt = ai.definePrompt({
  name: 'priceHistoryPrompt',
  input: {schema: PriceHistoryInputSchema},
  output: {schema: PriceHistoryOutputSchema},
  tools: [getHistoricalPricesForRoute],
  prompt: `You are a flight price analyst.
  The user has provided a flight route. Use the 'getHistoricalPricesForRoute' tool to retrieve the historical price data for the last 90 days.
  
  Route: {{{route}}}
  
  Return whether the route has data and the list of price points. If not, just return isValidRoute: false.`,
});

const priceHistoryFlow = ai.defineFlow(
  {
    name: 'priceHistoryFlow',
    inputSchema: PriceHistoryInputSchema,
    outputSchema: PriceHistoryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
