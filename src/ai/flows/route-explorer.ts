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
            { code: 'LAX', name: 'Los Angeles', country: 'USA' },
            { code: 'LHR', name: 'London', country: 'UK' },
            { code: 'CDG', name: 'Paris', country: 'France' },
            { code: 'FRA', name: 'Frankfurt', country: 'Germany' },
            { code: 'MEX', name: 'Mexico City', country: 'Mexico' },
            { code: 'MIA', name: 'Miami', country: 'USA' },
            { code: 'SFO', name: 'San Francisco', country: 'USA' },
            { code: 'ATL', name: 'Atlanta', country: 'USA' },
            { code: 'JNB', name: 'Johannesburg', country: 'South Africa' },
            { code: 'DXB', name: 'Dubai', country: 'UAE' },
            { code: 'HND', name: 'Tokyo', country: 'Japan' },
            { code: 'GRU', name: 'Sao Paulo', country: 'Brazil' },
            { code: 'SYD', name: 'Sydney', country: 'Australia' },
            { code: 'BOM', name: 'Mumbai', country: 'India' },
        ],
      },
      'LHR': {
        name: 'London Heathrow',
        destinations: [
          { code: 'JFK', name: 'New York', country: 'USA' },
          { code: 'SIN', name: 'Singapore', country: 'Singapore' },
          { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong' },
          { code: 'SYD', name: 'Sydney', country: 'Australia' },
          { code: 'DXB', name: 'Dubai', country: 'UAE' },
          { code: 'JNB', name: 'Johannesburg', country: 'South Africa' },
        ],
      },
      'SYD': {
        name: 'Sydney Airport',
        destinations: [
          { code: 'LAX', name: 'Los Angeles', country: 'USA' },
          { code: 'SIN', name: 'Singapore', country: 'Singapore' },
          { code: 'AKL', name: 'Auckland', country: 'New Zealand' },
          { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong' },
          { code: 'DXB', name: 'Dubai', country: 'UAE' },
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
  
  Airport: {{{airport}}}
  
  Return the validation status, airport name, and list of destinations. If the airport is invalid, just return isValidAirport: false.`,
});

const routeExplorerFlow = ai.defineFlow(
  {
    name: 'routeExplorerFlow',
    inputSchema: RouteExplorerInputSchema,
    outputSchema: RouteExplorerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output?.isValidAirport && output.destinations && output.destinations.length > 0) {
        const imageGenPrompt = `A stylized, minimalist world map showing flight paths originating from ${output.airportName}. The map should have a clean, modern aesthetic, with deep sky blue oceans and light gray continents. Show numerous bright orange flight paths radiating out from the origin to various international destinations.`;

        try {
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: imageGenPrompt,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });

            if (media?.url) {
                output.mapImageUrl = media.url;
            } else {
                 output.mapImageUrl = 'https://placehold.co/800x400.png';
            }
        } catch (e) {
            console.error("Image generation for route map failed:", e);
            output.mapImageUrl = 'https://placehold.co/800x400.png';
        }
    } else if (output?.isValidAirport) {
        output.mapImageUrl = 'https://placehold.co/800x400.png';
    }
    return output!;
  }
);
