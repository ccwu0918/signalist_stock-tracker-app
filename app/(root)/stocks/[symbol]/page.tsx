import { Suspense } from 'react';
import { getStockDetails } from '@/lib/actions/finnhub';
import { formatPrice, formatPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import WatchlistButton from '@/components/WatchlistButton';
import InvestingWidget from '@/components/InvestingWidget';

export const dynamic = 'force-dynamic';

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol);
  const upperSymbol = symbol.toUpperCase();

  const stockData = await getStockDetails(upperSymbol);

  const isTaiwanStock = upperSymbol.endsWith('.TW');
  const hasLimitedData = isTaiwanStock && (!stockData.marketCap || !stockData.peRatio);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{upperSymbol}</h1>
            <WatchlistButton symbol={upperSymbol} />
          </div>
          {stockData.name && (
            <p className="text-muted-foreground text-lg">{stockData.name}</p>
          )}
          {stockData.exchange && (
            <Badge variant="secondary" className="mt-2">
              {stockData.exchange}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">
            {formatPrice(stockData.currentPrice)}
          </div>
          {stockData.change !== null && stockData.percentChange !== null && (
            <div className={`text-lg ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stockData.change >= 0 ? '+' : ''}{formatPrice(stockData.change)} (
              {formatPercentage(stockData.percentChange)})
            </div>
          )}
        </div>
      </div>

      {hasLimitedData && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Limited data for {upperSymbol}.</strong> Finnhub does not provide fundamentals for this symbol on your current plan,
              but charts are provided by Investing.com for Taiwan stocks.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stockData.previousClose !== null && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Previous Close</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle>{formatPrice(stockData.previousClose)}</CardTitle>
            </CardContent>
          </Card>
        )}
        {stockData.open !== null && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Open</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle>{formatPrice(stockData.open)}</CardTitle>
            </CardContent>
          </Card>
        )}
        {stockData.high !== null && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Day High</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle>{formatPrice(stockData.high)}</CardTitle>
            </CardContent>
          </Card>
        )}
        {stockData.low !== null && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Day Low</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle>{formatPrice(stockData.low)}</CardTitle>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
            {isTaiwanStock ? (
              <InvestingWidget symbol={upperSymbol} />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                Chart widget for non-Taiwan stocks coming soon
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>

      {(stockData.marketCap || stockData.peRatio) && (
        <div className="grid gap-6 md:grid-cols-2">
          {stockData.marketCap && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Market Cap</CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle>{formatPrice(stockData.marketCap)}</CardTitle>
              </CardContent>
            </Card>
          )}
          {stockData.peRatio && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>P/E Ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle>{stockData.peRatio.toFixed(2)}</CardTitle>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
