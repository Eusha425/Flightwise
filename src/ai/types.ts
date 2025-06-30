import {z} from 'genkit';

// From airline-comparison.ts
export const AirlineComparisonInputSchema = z.object({
  route: z.string().describe('The flight route (e.g., JFK-LHR).'),
});
export type AirlineComparisonInput = z.infer<typeof AirlineComparisonInputSchema>;

export const AirlineComparisonOutputSchema = z.object({
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

// From best-time-to-book-recommender.ts
export const BestTimeToBookRecommenderInputSchema = z.object({
  route: z.string().describe('The flight route (e.g., SYD-SIN-LHR).'),
  departureDate: z.string().describe('The departure date (YYYY-MM-DD).'),
});
export type BestTimeToBookRecommenderInput = z.infer<
  typeof BestTimeToBookRecommenderInputSchema
>;

export const BestTimeToBookRecommenderOutputSchema = z.object({
  recommendation: z
    .string()
    .describe(
      'The recommended time to book the flight, along with a confidence level.'
    ),
});
export type BestTimeToBookRecommenderOutput = z.infer<
  typeof BestTimeToBookRecommenderOutputSchema
>;

// From dashboard-analytics.ts
export const DashboardAnalyticsOutputSchema = z.object({
    totalRoutesAnalyzed: z.number().describe('A large, realistic number for total routes analyzed to date.'),
    totalRoutesAnalyzedChange: z.string().describe('A realistic percentage change from last month for routes analyzed, prefixed with + or -.'),
    pricePredictionsMade: z.number().describe('A large, realistic number for total price predictions made.'),
    pricePredictionsMadeChange: z.string().describe('A realistic percentage change from last month for predictions made, prefixed with + or -.'),
    hubAirportsCount: z.number().describe('A realistic number of major hub airports identified.'),
    underservedAirportsCount: z.number().describe('A realistic number of underserved airports identified for potential growth.'),
  });
export type DashboardAnalyticsOutput = z.infer<typeof DashboardAnalyticsOutputSchema>;
  
// From price-history.ts
export const PriceHistoryInputSchema = z.object({
  route: z.string().describe('The flight route (e.g., JFK-LHR).'),
});
export type PriceHistoryInput = z.infer<typeof PriceHistoryInputSchema>;

export const PriceHistoryOutputSchema = z.object({
    isValidRoute: z.boolean().describe('Whether the provided route has historical data.'),
    prices: z.array(z.object({
        date: z.string().describe('The date of the price point (YYYY-MM-DD).'),
        price: z.number().describe('The average price on that date.'),
    })).optional().describe('A list of historical price points for the last 90 days.'),
});
export type PriceHistoryOutput = z.infer<typeof PriceHistoryOutputSchema>;

export const PriceHistoryPromptInputSchema = z.object({
    route: z.string().describe('The flight route (e.g., JFK-LHR).'),
    currentDate: z.string().describe("Today's date in YYYY-MM-DD format.")
});

// From route-explorer.ts
export const RouteExplorerInputSchema = z.object({
  airport: z.string().describe('The IATA code of the origin airport (e.g., JFK).'),
});
export type RouteExplorerInput = z.infer<typeof RouteExplorerInputSchema>;

export const CoordsSchema = z.object({
    lat: z.number().describe('Latitude'),
    lon: z.number().describe('Longitude'),
});

export const RouteExplorerOutputSchema = z.object({
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
