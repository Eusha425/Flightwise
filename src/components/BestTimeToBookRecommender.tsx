'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getBookingRecommendation } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  route: z.string().min(3, 'Route must be at least 3 characters, e.g., SYD-LHR.'),
  departureDate: z.date({
    required_error: 'A departure date is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function BestTimeToBookRecommender() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      route: 'SYD-SIN-LHR',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const result = await getBookingRecommendation({
        route: values.route,
        departureDate: format(values.departureDate, 'yyyy-MM-dd'),
      });
      setRecommendation(result.recommendation);
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
        <CardTitle>Best Time to Book Recommender</CardTitle>
        <CardDescription>
          Enter a flight route and departure date to get an AI-powered
          recommendation on when to book for the best price.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Route</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., JFK-LHR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Departure Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Get Recommendation
              </Button>
            </form>
          </Form>

          <div className="flex min-h-[210px] items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8">
            {loading && (
              <div className="flex flex-col items-center gap-2 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Analyzing historical data...
                </p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {recommendation && (
              <div className="text-center">
                <p className="text-2xl font-bold tracking-tight text-primary">
                  Recommendation
                </p>
                <p className="mt-2 text-lg">{recommendation}</p>
              </div>
            )}
            {!loading && !error && !recommendation && (
              <div className="text-center text-muted-foreground">
                <Wand2 className="mx-auto mb-2 h-8 w-8" />
                <p>Your recommendation will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
