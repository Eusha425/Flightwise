'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
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
import { Loader2, Send, Globe, PlaneTakeoff } from 'lucide-react';
import { getRouteExplorerData } from '@/lib/actions';
import { type RouteExplorerOutput } from '@/ai/flows/route-explorer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  airport: z.string().min(3, 'Airport code must be 3 characters, e.g., JFK.').max(3, 'Airport code must be 3 characters, e.g., JFK.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RouteExplorer() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RouteExplorerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      airport: 'JFK',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getRouteExplorerData({
        airport: values.airport.toUpperCase(),
      });
      if (!result.isValidAirport) {
        setError(`Invalid airport code: ${values.airport.toUpperCase()}. Please try another like JFK, LHR, or SYD.`);
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
        <CardTitle>Interactive Route Explorer</CardTitle>
        <CardDescription>
          Enter an airport IATA code to discover all of its direct flight destinations and visualize them on a map.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="airport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin Airport</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JFK" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Explore Routes
                </Button>
              </form>
            </Form>
            {data?.destinations && (
                 <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Destinations from {data.airportName}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground max-h-80 overflow-y-auto">
                        {data.destinations.map(dest => (
                            <li key={dest.code} className="flex items-center gap-2">
                                <PlaneTakeoff className="h-4 w-4 text-primary" />
                                <span>{dest.name} ({dest.code}), {dest.country}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
          <div className="md:col-span-2 flex min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8">
            {loading && (
              <div className="flex flex-col items-center gap-2 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Loading routes...
                </p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {data?.mapImageUrl && (
              <div className="text-center w-full">
                <Image 
                    src={data.mapImageUrl} 
                    alt="Map of routes" 
                    width={800} 
                    height={400} 
                    className="rounded-lg object-cover"
                    data-ai-hint="world map"
                />
              </div>
            )}
            {!loading && !error && !data && (
              <div className="text-center text-muted-foreground">
                <Globe className="mx-auto mb-2 h-12 w-12" />
                <p>Your route map will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
