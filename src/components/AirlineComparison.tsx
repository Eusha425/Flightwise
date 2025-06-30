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
import { Loader2, Search, Star, Plane } from 'lucide-react';
import { getAirlineComparisonData } from '@/lib/actions';
import { type AirlineComparisonOutput } from '@/ai/flows/airline-comparison';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

const formSchema = z.object({
  route: z.string().regex(/^[A-Z]{3}-[A-Z]{3}$/, 'Route must be in the format XXX-YYY, e.g., JFK-LHR.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AirlineComparison() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AirlineComparisonOutput | null>(null);
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
      const result = await getAirlineComparisonData({
        route: values.route.toUpperCase(),
      });
      if (!result.isValidRoute) {
        setError(`Invalid route: ${values.route.toUpperCase()}. Please try another like JFK-LHR or SYD-LAX.`);
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
        <CardTitle>Airline Comparison Tool</CardTitle>
        <CardDescription>
          Compare airlines on a specific route based on rating, amenities, duration, and price.
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
                <Search className="mr-2 h-4 w-4" />
                )}
                Compare
            </Button>
            </form>
        </Form>
        
        <div className="flex min-h-[300px] items-start justify-center rounded-lg border border-dashed bg-muted/50 p-4">
            {loading && (
              <div className="flex flex-col items-center gap-2 text-center pt-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Fetching airline data...
                </p>
              </div>
            )}
            {error && (
              <div className="pt-24">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {data?.airlines && (
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Airline</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead>Amenities</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.airlines.sort((a,b) => b.rating - a.rating).map(airline => (
                        <TableRow key={airline.name}>
                            <TableCell className="font-medium">{airline.name}</TableCell>
                            <TableCell className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {airline.rating.toFixed(1)}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {airline.amenities.map(amenity => <Badge key={amenity} variant="secondary">{amenity}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{airline.duration}</TableCell>
                            <TableCell className="text-right font-semibold">${airline.price}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
            {!loading && !error && !data && (
              <div className="text-center text-muted-foreground pt-24">
                <Plane className="mx-auto mb-2 h-12 w-12" />
                <p>Your airline comparison will appear here.</p>
              </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}
