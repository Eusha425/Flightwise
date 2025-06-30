'use server';

import {
  bestTimeToBookRecommender,
  type BestTimeToBookRecommenderInput,
} from '@/ai/flows/best-time-to-book-recommender';

import {
    exploreRoute,
    type RouteExplorerInput,
} from '@/ai/flows/route-explorer';

import {
    getAirlineComparison,
    type AirlineComparisonInput,
} from '@/ai/flows/airline-comparison';

import {
    getPriceHistory,
    type PriceHistoryInput,
} from '@/ai/flows/price-history';

export async function getBookingRecommendation(
  input: BestTimeToBookRecommenderInput
) {
  return await bestTimeToBookRecommender(input);
}

export async function getRouteExplorerData(input: RouteExplorerInput) {
    return await exploreRoute(input);
}

export async function getAirlineComparisonData(input: AirlineComparisonInput) {
    return await getAirlineComparison(input);
}

export async function getPriceHistoryData(input: PriceHistoryInput) {
    return await getPriceHistory(input);
}
