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
    })).optional().describe('A list of reachable destinations.'),
});
export type RouteExplorerOutput = z.infer<typeof RouteExplorerOutputSchema>;

export async function exploreRoute(input: RouteExplorerInput): Promise<RouteExplorerOutput> {
  return routeExplorerFlow(input);
}

const getReachableDestinations = ai.defineTool({
    name: 'getReachableDestinations',
    description: 'Retrieves all reachable destinations from a given airport, including their coordinates.',
    inputSchema: z.object({
      airport: z.string().describe('The IATA code of the origin airport.'),
    }),
    outputSchema: z.object({
      isValidAirport: z.boolean(),
      airportName: z.string().optional(),
      originCoords: CoordsSchema.optional(),
      destinations: z.array(z.object({
          code: z.string(),
          name: z.string(),
          country: z.string(),
          coords: CoordsSchema,
        })).optional(),
    }),
  }, async ({ airport }) => {
    // Placeholder data with coordinates
    const airportData: { [key: string]: any } = {
      'JFK': {
        name: 'John F. Kennedy International Airport',
        coords: { lat: 40.6413, lon: -73.7781 },
        destinations: [
            { code: 'LAX', name: 'Los Angeles', country: 'USA', coords: { lat: 33.9416, lon: -118.4085 } },
            { code: 'LHR', name: 'London', country: 'UK', coords: { lat: 51.4700, lon: -0.4543 } },
            { code: 'CDG', name: 'Paris', country: 'France', coords: { lat: 49.0097, lon: 2.5479 } },
            { code: 'FRA', name: 'Frankfurt', country: 'Germany', coords: { lat: 50.0379, lon: 8.5622 } },
            { code: 'MEX', name: 'Mexico City', country: 'Mexico', coords: { lat: 19.4363, lon: -99.0721 } },
            { code: 'MIA', name: 'Miami', country: 'USA', coords: { lat: 25.7959, lon: -80.2870 } },
            { code: 'SFO', name: 'San Francisco', country: 'USA', coords: { lat: 37.6213, lon: -122.3790 } },
            { code: 'ATL', name: 'Atlanta', country: 'USA', coords: { lat: 33.6407, lon: -84.4277 } },
            { code: 'JNB', name: 'Johannesburg', country: 'South Africa', coords: { lat: -26.1392, lon: 28.2460 } },
            { code: 'DXB', name: 'Dubai', country: 'UAE', coords: { lat: 25.2532, lon: 55.3657 } },
            { code: 'HND', name: 'Tokyo', country: 'Japan', coords: { lat: 35.5494, lon: 139.7798 } },
            { code: 'GRU', name: 'Sao Paulo', country: 'Brazil', coords: { lat: -23.4356, lon: -46.4731 } },
            { code: 'SYD', name: 'Sydney', country: 'Australia', coords: { lat: -33.9399, lon: 151.1753 } },
            { code: 'BOM', name: 'Mumbai', country: 'India', coords: { lat: 19.0896, lon: 72.8656 } },
        ],
      },
      'LHR': {
        name: 'London Heathrow',
        coords: { lat: 51.4700, lon: -0.4543 },
        destinations: [
          { code: 'JFK', name: 'New York', country: 'USA', coords: { lat: 40.6413, lon: -73.7781 } },
          { code: 'SIN', name: 'Singapore', country: 'Singapore', coords: { lat: 1.3644, lon: 103.9915 } },
          { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong', coords: { lat: 22.3080, lon: 113.9185 } },
          { code: 'SYD', name: 'Sydney', country: 'Australia', coords: { lat: -33.9399, lon: 151.1753 } },
          { code: 'DXB', name: 'Dubai', country: 'UAE', coords: { lat: 25.2532, lon: 55.3657 } },
          { code: 'JNB', name: 'Johannesburg', country: 'South Africa', coords: { lat: -26.1392, lon: 28.2460 } },
        ],
      },
      'SYD': {
        name: 'Sydney Airport',
        coords: { lat: -33.9399, lon: 151.1753 },
        destinations: [
          { code: 'LAX', name: 'Los Angeles', country: 'USA', coords: { lat: 33.9416, lon: -118.4085 } },
          { code: 'SIN', name: 'Singapore', country: 'Singapore', coords: { lat: 1.3644, lon: 103.9915 } },
          { code: 'AKL', name: 'Auckland', country: 'New Zealand', coords: { lat: -37.0082, lon: 174.7917 } },
          { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong', coords: { lat: 22.3080, lon: 113.9185 } },
          { code: 'DXB', name: 'Dubai', country: 'UAE', coords: { lat: 25.2532, lon: 55.3657 } },
        ],
      },
      'DAC': {
        name: 'Shahjalal International Airport',
        coords: { lat: 23.8433, lon: 90.3978 },
        destinations: [
            { code: 'DXB', name: 'Dubai', country: 'UAE', coords: { lat: 25.2532, lon: 55.3657 } },
            { code: 'SIN', name: 'Singapore', country: 'Singapore', coords: { lat: 1.3644, lon: 103.9915 } },
            { code: 'KUL', name: 'Kuala Lumpur', country: 'Malaysia', coords: { lat: 2.7456, lon: 101.7072 } },
            { code: 'BKK', name: 'Bangkok', country: 'Thailand', coords: { lat: 13.6900, lon: 100.7501 } },
            { code: 'CCU', name: 'Kolkata', country: 'India', coords: { lat: 22.6547, lon: 88.4467 } },
            { code: 'JED', name: 'Jeddah', country: 'Saudi Arabia', coords: { lat: 21.6796, lon: 39.1565 } },
            { code: 'KTM', name: 'Kathmandu', country: 'Nepal', coords: { lat: 27.6966, lon: 85.3592 } },
        ],
      },
    };
    const data = airportData[airport.toUpperCase()];
    if (data) {
      return { isValidAirport: true, airportName: data.name, originCoords: data.coords, destinations: data.destinations };
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
  
  Return the validation status, airport name, origin coordinates, and list of destinations with their coordinates. If the airport is invalid, just return isValidAirport: false.`,
});

const routeExplorerFlow = ai.defineFlow(
  {
    name: 'routeExplorerFlow',
    inputSchema: RouteExplorerInputSchema,
    outputSchema: RouteExplorerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
