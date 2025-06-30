'use server';

import { bestTimeToBookRecommender } from '@/ai/flows/best-time-to-book-recommender';
import { exploreRoute } from '@/ai/flows/route-explorer';
import { getAirlineComparison as getAirlineComparisonFlow } from '@/ai/flows/airline-comparison';
import { getPriceHistory as getPriceHistoryFlow } from '@/ai/flows/price-history';
import { getDashboardAnalytics as getDashboardAnalyticsFlow } from '@/ai/flows/dashboard-analytics';

import type {
    BestTimeToBookRecommenderInput,
    BestTimeToBookRecommenderOutput,
    RouteExplorerInput,
    RouteExplorerOutput,
    AirlineComparisonInput,
    AirlineComparisonOutput,
    PriceHistoryInput,
    PriceHistoryOutput,
    DashboardAnalyticsOutput
} from '@/ai/types';

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

export async function getDashboardAnalytics(): Promise<DashboardAnalyticsOutput> {
    return await getDashboardAnalyticsFlow();
}
