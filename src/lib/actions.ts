'use server';

import {
  bestTimeToBookRecommender,
  type BestTimeToBookRecommenderInput,
} from '@/ai/flows/best-time-to-book-recommender';

export async function getBookingRecommendation(
  input: BestTimeToBookRecommenderInput
) {
  return await bestTimeToBookRecommender(input);
}
