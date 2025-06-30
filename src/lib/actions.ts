'use server';

import {
  bestTimeToBookRecommender,
  type BestTimeToBookRecommenderInput,
  type BestTimeToBookRecommenderOutput,
} from '@/ai/flows/best-time-to-book-recommender';

import {
    exploreRoute,
    type RouteExplorerInput,
    type RouteExplorerOutput,
} from '@/ai/flows/route-explorer';

import {
    getAirlineComparison as getAirlineComparisonFlow,
    type AirlineComparisonInput,
    type AirlineComparisonOutput,
} from '@/ai/flows/airline-comparison';

import {
    getPriceHistory as getPriceHistoryFlow,
    type PriceHistoryInput,
    type PriceHistoryOutput,
} from '@/ai/flows/price-history';

export async function getBookingRecommendation(
  input: BestTimeToBookRecommenderInput
): Promise<BestTimeToBookRecommenderOutput> {
  return await bestTimeToBookRecommender(input);
}

export async function getRouteExplorerData(input: RouteExplorerInput): Promise<RouteExplorerOutput> {
    return await exploreRoute(input);
}

export async function getAirlineComparison(input: AirlineComparisonInput): Promise<AirlineComparisonOutput> {
    return await getAirlineComparisonFlow(input);
}

export async function getPriceHistory(input: PriceHistoryInput): Promise<PriceHistoryOutput> {
    return await getPriceHistoryFlow(input);
}
