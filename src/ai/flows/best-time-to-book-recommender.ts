// src/ai/flows/best-time-to-book-recommender.ts
'use server';

/**
 * @fileOverview Recommends the best time to book a flight for a given route and date using historical pricing data.
 *
 * - bestTimeToBookRecommender - A function that handles the recommendation process.
 * - BestTimeToBookRecommenderInput - The input type for the bestTimeToBookRecommender function.
 * - BestTimeToBookRecommenderOutput - The return type for the bestTimeToBookRecommender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BestTimeToBookRecommenderInputSchema = z.object({
  route: z.string().describe('The flight route (e.g., SYD-SIN-LHR).'),
  departureDate: z.string().describe('The departure date (YYYY-MM-DD).'),
});
export type BestTimeToBookRecommenderInput = z.infer<
  typeof BestTimeToBookRecommenderInputSchema
>;

const BestTimeToBookRecommenderOutputSchema = z.object({
  recommendation: z
    .string()
    .describe(
      'The recommended time to book the flight, along with a confidence level.'
    ),
});
export type BestTimeToBookRecommenderOutput = z.infer<
  typeof BestTimeToBookRecommenderOutputSchema
>;

export async function bestTimeToBookRecommender(
  input: BestTimeToBookRecommenderInput
): Promise<BestTimeToBookRecommenderOutput> {
  return bestTimeToBookRecommenderFlow(input);
}

const getHistoricalFlightPrices = ai.defineTool({
  name: 'getHistoricalFlightPrices',
  description: 'Retrieves historical flight prices for a given route and date.',
  inputSchema: z.object({
    route: z.string().describe('The flight route (e.g., SYD-SIN-LHR).'),
    departureDate: z.string().describe('The departure date (YYYY-MM-DD).'),
  }),
  outputSchema: z.array(z.object({
    date: z.string().describe('Date of the flight price data'),
    price: z.number().describe('Price of the flight'),
  })),
}, async ({ route, departureDate }) => {
    console.log("getHistoricalFlightPrices called with", { route, departureDate });

    // In a real application, you would fetch this from a database.
    // For this demo, we'll generate some plausible-looking data.
    if (!['JFK-LHR', 'SYD-LAX', 'SYD-SIN-LHR'].includes(route.toUpperCase())) {
        // Return an empty array if the route is not supported in this demo
        return [];
    }

    const historicalData = [];
    const today = new Date();
    // Generate data for the 90 days leading up to today.
    for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // Base price varies by route
        const basePrice = route.toUpperCase() === 'JFK-LHR' ? 600 : 1100;
        
        // Simulate price fluctuations (e.g., sine wave for seasonality + random noise)
        const price = basePrice + Math.sin(i / 10) * 100 + Math.random() * 50 - 25;
        
        historicalData.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(price),
        });
    }

    return historicalData;
  },
);

const prompt = ai.definePrompt({
  name: 'bestTimeToBookPrompt',
  input: {schema: BestTimeToBookRecommenderInputSchema},
  output: {schema: BestTimeToBookRecommenderOutputSchema},
  tools: [getHistoricalFlightPrices],
  prompt: `You are an expert travel consultant. Your goal is to recommend the best time to book a flight based on historical price data.

  The user wants to travel the route '{{{route}}}' on '{{{departureDate}}}'.

  You have access to a tool called 'getHistoricalFlightPrices' that provides past price data for this route.

  1. Call the 'getHistoricalFlightPrices' tool with the user's route and departure date.
  2. Analyze the historical price data returned by the tool. Look for trends (e.g., are prices generally increasing, decreasing, or stable?).
  3. Based on your analysis, provide a clear recommendation. For example: "Prices are currently low, book now. Confidence: High." or "Prices are trending down, it's better to wait a few weeks. Confidence: Medium."
  4. Formulate your final answer into the required JSON format.
`,config: {
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
