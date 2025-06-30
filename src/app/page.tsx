import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlightWiseLogo } from '@/components/FlightWiseLogo';
import BestTimeToBookRecommender from '@/components/BestTimeToBookRecommender';
import { CircleDotDashed, DollarSign, PlaneLanding, Waypoints } from 'lucide-react';

function PlaceholderComponent({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex min-h-[450px] flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
        <nav className="flex w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <FlightWiseLogo className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">FlightWise</span>
          </a>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Routes Analyzed
              </CardTitle>
              <Waypoints className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234,567</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Price Predictions
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hub Airports</CardTitle>
              <CircleDotDashed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Top airports by connectivity
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Underserved Airports
              </CardTitle>
              <PlaneLanding className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                Identified for potential growth
              </p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="recommender" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="recommender">Best Time to Book</TabsTrigger>
            <TabsTrigger value="explorer">Route Explorer</TabsTrigger>
            <TabsTrigger value="comparison">Airline Comparison</TabsTrigger>
            <TabsTrigger value="history">Price History</TabsTrigger>
          </TabsList>
          <TabsContent value="recommender">
            <BestTimeToBookRecommender />
          </TabsContent>
          <TabsContent value="explorer">
            <PlaceholderComponent title="Interactive Route Explorer" />
          </TabsContent>
          <TabsContent value="comparison">
            <PlaceholderComponent title="Airline Comparison Tool" />
          </TabsContent>
          <TabsContent value="history">
            <PlaceholderComponent title="Price History Visualization" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
