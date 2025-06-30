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
}, async (input) => {
    // TODO: Implement the logic to fetch historical flight prices from a data source
    // This is a placeholder implementation, replace with actual data retrieval.
    console.log("getHistoricalFlightPrices called with", input);

    const historicalData = [
      {date: '2024-01-01', price: 1200},
      {date: '2024-01-15', price: 1100},
      {date: '2024-02-01', price: 1300},
      {date: '2024-_02-15', price: 1000},
      {date: '2024-03-01', price: 1150},
    ];

    return historicalData;
  },
);

const prompt = ai.definePrompt({
  name: 'bestTimeToBookPrompt',
  input: {schema: BestTimeToBookRecommenderInputSchema},
  output: {schema: BestTimeToBookRecommenderOutputSchema},
  tools: [getHistoricalFlightPrices],
  prompt: `You are an expert travel consultant. Given a flight route and departure date, analyze historical pricing data to recommend the best time to book the flight.

  Consider factors such as price trends, seasonality, and potential fluctuations.

  Route: {{{route}}}
  Departure Date: {{{departureDate}}}

  Use the getHistoricalFlightPrices tool to retrieve historical pricing data for the specified route and date.

  Based on the data, provide a concise recommendation with a confidence level (high, medium, low).
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
