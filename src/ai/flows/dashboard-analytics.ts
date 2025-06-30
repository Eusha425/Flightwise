'use server';

/**
 * @fileOverview Generates dynamic analytics for the main dashboard.
 *
 * - getDashboardAnalytics - A function that returns dynamic dashboard metrics.
 */

import {ai} from '@/ai/genkit';
import { 
    DashboardAnalyticsOutputSchema,
    type DashboardAnalyticsOutput,
} from '@/ai/types';


export async function getDashboardAnalytics(): Promise<DashboardAnalyticsOutput> {
  return dashboardAnalyticsFlow();
}

const prompt = ai.definePrompt({
  name: 'dashboardAnalyticsPrompt',
  output: {schema: DashboardAnalyticsOutputSchema},
  prompt: `You are a data analyst for an airline intelligence platform called FlightWise. 
  Your task is to generate a set of realistic (but fictional) key performance indicators for the main dashboard.
  These numbers should look plausible and impressive.
  Please generate the data in the required JSON format.`,
});

const dashboardAnalyticsFlow = ai.defineFlow(
  {
    name: 'dashboardAnalyticsFlow',
    outputSchema: DashboardAnalyticsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
