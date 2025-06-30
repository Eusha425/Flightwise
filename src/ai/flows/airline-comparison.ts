// src/ai/flows/airline-comparison.ts
'use server';

/**
 * @fileOverview Compares airlines for a given route.
 *
 * - getAirlineComparison - A function that handles the airline comparison process.
 * - AirlineComparisonInput - The input type for the getAirlineComparison function.
 * - AirlineComparisonOutput - The return type for the getAirlineComparison function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AirlineComparisonInputSchema = z.object({
  route: z.string().describe('The flight route (e.g., JFK-LHR).'),
});
export type AirlineComparisonInput = z.infer<typeof AirlineComparisonInputSchema>;

const AirlineComparisonOutputSchema = z.object({
  isValidRoute: z.boolean().describe('Whether the provided route is valid.'),
  airlines: z.array(z.object({
      name: z.string().describe('Airline name.'),
      rating: z.number().describe('Customer rating out of 5.'),
      amenities: z.array(z.string()).describe('List of in-flight amenities.'),
      duration: z.string().describe('Typical flight duration.'),
      price: z.number().describe('Typical price for the route.'),
    })).optional().describe('A list of airlines servicing the route.'),
});
export type AirlineComparisonOutput = z.infer<typeof AirlineComparisonOutputSchema>;

export async function getAirlineComparison(input: AirlineComparisonInput): Promise<AirlineComparisonOutput> {
  return airlineComparisonFlow(input);
}

const getAirlineDataForRoute = ai.defineTool({
    name: 'getAirlineDataForRoute',
    description: 'Retrieves airline comparison data for a given flight route.',
    inputSchema: z.object({
      route: z.string().describe('The flight route (e.g., JFK-LHR).'),
    }),
    outputSchema: z.object({
      isValidRoute: z.boolean(),
      airlines: z.array(z.object({
          name: z.string(),
          rating: z.number(),
          amenities: z.array(z.string()),
          duration: z.string(),
          price: z.number(),
        })).optional(),
    }),
  }, async ({ route }) => {
    // Placeholder data
    const routeData: { [key: string]: any } = {
      'JFK-LHR': {
        airlines: [
          { name: 'American Airlines', rating: 4.2, amenities: ['WiFi', 'In-flight Entertainment', 'Meals'], duration: '7h 30m', price: 650 },
          { name: 'British Airways', rating: 4.5, amenities: ['WiFi', 'In-flight Entertainment', 'Meals', 'Lounge Access'], duration: '7h 15m', price: 720 },
          { name: 'Virgin Atlantic', rating: 4.7, amenities: ['WiFi', 'Premium Entertainment', 'Gourmet Meals', 'Bar'], duration: '7h 20m', price: 750 },
          { name: 'Norse Atlantic', rating: 3.8, amenities: ['WiFi (paid)', 'Basic Snacks'], duration: '7h 45m', price: 450 },
        ],
      },
      'SYD-LAX': {
        airlines: [
          { name: 'Qantas', rating: 4.6, amenities: ['WiFi', 'In-flight Entertainment', 'Meals', 'Amenity Kit'], duration: '14h 0m', price: 1200 },
          { name: 'Delta Air Lines', rating: 4.3, amenities: ['WiFi', 'In-flight Entertainment', 'Meals'], duration: '14h 20m', price: 1150 },
          { name: 'United Airlines', rating: 4.1, amenities: ['WiFi', 'In-flight Entertainment', 'Meals'], duration: '14h 30m', price: 1100 },
        ],
      },
    };
    const data = routeData[route.toUpperCase()];
    if (data) {
      return { isValidRoute: true, airlines: data.airlines };
    }
    return { isValidRoute: false };
  }
);


const prompt = ai.definePrompt({
  name: 'airlineComparisonPrompt',
  input: {schema: AirlineComparisonInputSchema},
  output: {schema: AirlineComparisonOutputSchema},
  tools: [getAirlineDataForRoute],
  prompt: `You are an expert flight comparison analyst.
  The user has provided a flight route. Use the 'getAirlineDataForRoute' tool to find and compare airlines that operate on this route.
  
  Route: {{{route}}}
  
  Return whether the route is valid and the list of airlines with their details. If the route is invalid, just return isValidRoute: false.`,
});

const airlineComparisonFlow = ai.defineFlow(
  {
    name: 'airlineComparisonFlow',
    inputSchema: AirlineComparisonInputSchema,
    outputSchema: AirlineComparisonOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
