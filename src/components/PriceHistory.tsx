'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, AreaChart, TrendingUp } from 'lucide-react';
import { getPriceHistory } from '@/lib/actions';
import { type PriceHistoryOutput } from '@/ai/flows/price-history';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
    route: z.string().regex(/^([A-Z]{3}-)+[A-Z]{3}$/, 'Route must be in format XXX-YYY or XXX-YYY-ZZZ.'),
});

type FormValues = z.infer<typeof formSchema>;

const chartConfig = {
  price: {
    label: 'Price (USD)',
    color: 'hsl(var(--primary))',
  },
};

export default function PriceHistory() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PriceHistoryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      route: 'JFK-LHR',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getPriceHistory({
        route: values.route.toUpperCase(),
      });
      if (!result.isValidRoute) {
        setError(`No historical data for route: ${values.route.toUpperCase()}. Please try another like JFK-LHR or SYD-LAX.`);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History Visualization</CardTitle>
        <CardDescription>
          Enter a flight route to see the price trends over the last 90 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
      <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4 mb-8">
            <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                <FormItem className="flex-grow">
                    <FormLabel>Flight Route</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., JFK-LHR" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="h-10" disabled={loading}>
                {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
                )}
                Visualize
            </Button>
            </form>
        </Form>
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/50 p-4">
            {loading && (
              <div className="flex flex-col items-center gap-2 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Loading price history...
                </p>
              </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {data?.prices && (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.prices} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    labelFormatter={(label) => format(new Date(label), 'PPP')}
                                    indicator="dot"
                                />}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: "hsl(var(--primary))",
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
            {!loading && !error && !data && (
              <div className="text-center text-muted-foreground">
                <AreaChart className="mx-auto mb-2 h-12 w-12" />
                <p>Your price history chart will appear here.</p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
