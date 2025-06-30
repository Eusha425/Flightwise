'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Map, { Marker, Source, Layer, type LayerProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

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
import { Loader2, Send, Globe, PlaneTakeoff, MapPin } from 'lucide-react';
import { getRouteExplorerData } from '@/lib/actions';
import { type RouteExplorerOutput } from '@/ai/flows/route-explorer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  airport: z.string().min(3, 'Airport code must be 3 characters, e.g., JFK.').max(3, 'Airport code must be 3 characters, e.g., JFK.'),
});

type FormValues = z.infer<typeof formSchema>;

const routeLayer: LayerProps = {
    id: 'routes',
    type: 'line',
    source: 'routes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': 'hsl(var(--accent))',
      'line-width': 2,
      'line-opacity': 0.8,
    },
};

const cartoDarkStyle = {
    version: 8,
    sources: {
        'carto-dark': {
            type: 'raster',
            tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
    },
    layers: [
        {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 22,
        },
    ],
};

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

  const routeGeoJson = useMemo(() => {
    if (!data?.originCoords || !data.destinations) return null;
    const features = data.destinations.map(dest => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
            type: 'LineString' as const,
            coordinates: [
                [data.originCoords!.lon, data.originCoords!.lat],
                [dest.coords.lon, dest.coords.lat]
            ]
        }
    }));
    return {
        type: 'FeatureCollection' as const,
        features,
    };
  }, [data]);

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
          <div className="md:col-span-2 flex min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/50 p-1 md:p-2">
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
            {data && data.originCoords && data.destinations && (
              <Map
                initialViewState={{
                  longitude: data.originCoords.lon,
                  latitude: data.originCoords.lat,
                  zoom: 3,
                }}
                mapStyle={cartoDarkStyle as any}
                style={{width: '100%', height: '100%', borderRadius: '0.5rem'}}
              >
                {routeGeoJson && (
                    <Source id="routes" type="geojson" data={routeGeoJson}>
                        <Layer {...routeLayer} />
                    </Source>
                )}
                <Marker longitude={data.originCoords.lon} latitude={data.originCoords.lat}>
                    <PlaneTakeoff className="h-6 w-6 text-primary fill-primary" />
                </Marker>
                {data.destinations.map(dest => (
                    <Marker key={dest.code} longitude={dest.coords.lon} latitude={dest.coords.lat}>
                        <MapPin className="h-5 w-5 text-accent fill-accent" />
                    </Marker>
                ))}
              </Map>
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
