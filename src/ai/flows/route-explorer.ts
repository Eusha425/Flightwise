// src/ai/flows/route-explorer.ts
'use server';

/**
 * @fileOverview Finds all reachable destinations from a given airport using AI.
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

const CoordsSchema = z.object({
    lat: z.number().describe('Latitude'),
    lon: z.number().describe('Longitude'),
});

const RouteExplorerOutputSchema = z.object({
  isValidAirport: z.boolean().describe('Whether the provided airport code is valid.'),
  airportName: z.string().optional().describe('The full name of the airport.'),
  originCoords: CoordsSchema.optional().describe('The coordinates of the origin airport.'),
  destinations: z.array(z.object({
      code: z.string().describe('IATA code of the destination airport.'),
      name: z.string().describe('Name of the destination city/airport.'),
      country: z.string().describe('Country of the destination.'),
      coords: CoordsSchema.describe('Coordinates of the destination airport.'),
    })).optional().describe('A list of at least 10 major direct flight destinations.'),
});
export type RouteExplorerOutput = z.infer<typeof RouteExplorerOutputSchema>;

export async function exploreRoute(input: RouteExplorerInput): Promise<RouteExplorerOutput> {
  return routeExplorerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'routeExplorerPrompt',
  input: {schema: RouteExplorerInputSchema},
  output: {schema: RouteExplorerOutputSchema},
  prompt: `You are an airline route expert and data analyst. Your task is to provide information about direct flight destinations from a given airport based on your knowledge.

  For the origin airport with IATA code '{{{airport}}}', please provide the following:
  1.  Validate if the airport code is a real, valid IATA code.
  2.  If valid, provide its full name and geographical coordinates (latitude and longitude).
  3.  Provide a list of at least 10 major direct flight destinations from this airport. For major hubs, you can provide more.
  4.  For each destination, include its IATA code, city name, country, and geographical coordinates.

  If the airport code is invalid, you must set 'isValidAirport' to false and leave all other fields empty or null.

  Please provide the response in the structured JSON format defined by the output schema.
  
  Airport: {{{airport}}}`,
});

const routeExplorerFlow = ai.defineFlow(
  {
    name: 'routeExplorerFlow',
    inputSchema: RouteExplorerInputSchema,
    outputSchema: RouteExplorerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    if (!output) {
      return { isValidAirport: false };
    }

    // If the model claims the airport is valid but provides no destinations,
    // we override it to be invalid to give the user proper feedback.
    if (output.isValidAirport && (!output.destinations || output.destinations.length === 0)) {
      return { isValidAirport: false };
    }
    
    return output;
  }
);
