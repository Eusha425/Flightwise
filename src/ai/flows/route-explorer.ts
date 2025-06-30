// src/ai/flows/route-explorer.ts
'use server';

/**
 * @fileOverview Finds all reachable destinations from a given airport.
 *
 * - exploreRoute - A function that handles the route exploration process.
 * - RouteExplorerInput - The input type for the exploreRoute function.
 * - RouteExplorerOutput - The return type for the exploreRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RouteExplorerInputSchema = z.object({
  airport: z.string().describe('The IATA code of the origin airport (e.g., JFK).'),
});
export type RouteExplorerInput = z.infer<typeof RouteExplorerInputSchema>;

const RouteExplorerOutputSchema = z.object({
  isValidAirport: z.boolean().describe('Whether the provided airport code is valid.'),
  airportName: z.string().optional().describe('The full name of the airport.'),
  destinations: z.array(z.object({
      code: z.string().describe('IATA code of the destination airport.'),
      name: z.string().describe('Name of the destination city/airport.'),
      country: z.string().describe('Country of the destination.'),
    })).optional().describe('A list of reachable destinations.'),
  mapImageUrl: z.string().optional().describe('A URL for an image of a map showing the routes.'),
});
export type RouteExplorerOutput = z.infer<typeof RouteExplorerOutputSchema>;

export async function exploreRoute(input: RouteExplorerInput): Promise<RouteExplorerOutput> {
  return routeExplorerFlow(input);
}

const getReachableDestinations = ai.defineTool({
    name: 'getReachableDestinations',
    description: 'Retrieves all reachable destinations from a given airport.',
    inputSchema: z.object({
      airport: z.string().describe('The IATA code of the origin airport.'),
    }),
    outputSchema: z.object({
      isValidAirport: z.boolean(),
      airportName: z.string().optional(),
      destinations: z.array(z.object({
          code: z.string(),
          name: z.string(),
          country: z.string(),
        })).optional(),
    }),
  }, async ({ airport }) => {
    // Placeholder data
    const airportData: { [key: string]: any } = {
      'JFK': {
        name: 'John F. Kennedy International Airport',
        destinations: [
          { code: 'LHR', name: 'London Heathrow', country: 'UK' },
          { code: 'CDG', name: 'Charles de Gaulle Airport', country: 'France' },
          { code: 'NRT', name: 'Narita International Airport', country: 'Japan' },
          { code: 'LAX', name: 'Los Angeles International Airport', country: 'USA' },
          { code: 'DXB', name: 'Dubai International Airport', country: 'UAE' },
        ],
      },
      'LHR': {
        name: 'London Heathrow',
        destinations: [
          { code: 'JFK', name: 'John F. Kennedy International Airport', country: 'USA' },
          { code: 'SIN', name: 'Singapore Changi Airport', country: 'Singapore' },
          { code: 'HKG', name: 'Hong Kong International Airport', country: 'Hong Kong' },
          { code: 'SYD', name: 'Sydney Airport', country: 'Australia' },
        ],
      },
      'SYD': {
        name: 'Sydney Airport',
        destinations: [
          { code: 'LAX', name: 'Los Angeles International Airport', country: 'USA' },
          { code: 'SIN', name: 'Singapore Changi Airport', country: 'Singapore' },
          { code: 'AKL', name: 'Auckland Airport', country: 'New Zealand' },
        ],
      },
    };
    const data = airportData[airport.toUpperCase()];
    if (data) {
      return { isValidAirport: true, airportName: data.name, destinations: data.destinations };
    }
    return { isValidAirport: false };
  }
);


const prompt = ai.definePrompt({
  name: 'routeExplorerPrompt',
  input: {schema: RouteExplorerInputSchema},
  output: {schema: RouteExplorerOutputSchema},
  tools: [getReachableDestinations],
  prompt: `You are an airline route analyst.
  The user has provided an airport code. Use the 'getReachableDestinations' tool to find all direct flight destinations from that airport.
  If the airport is valid, also generate a placeholder map image URL from placehold.co showing a generic world map (e.g. 800x400).
  
  Airport: {{{airport}}}
  
  Return the validation status, airport name, list of destinations, and map image URL. If the airport is invalid, just return isValidAirport: false.`,
});

const routeExplorerFlow = ai.defineFlow(
  {
    name: 'routeExplorerFlow',
    inputSchema: RouteExplorerInputSchema,
    outputSchema: RouteExplorerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output?.isValidAirport) {
        output.mapImageUrl = 'https://placehold.co/800x400.png';
    }
    return output!;
  }
);
