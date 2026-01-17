import { Suspense } from 'react';
import { getStockDetails } from '@/lib/actions/finnhub';
import { formatPrice, formatPercentage } from '@/lib/utils';
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
            <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm mt-2">
              {stockData.exchange}
            </span>
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
        <div className="mb-6 border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Limited data for {upperSymbol}.</strong> Finnhub does not provide fundamentals for this symbol on your current plan,
            but charts are provided by Investing.com for Taiwan stocks.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stockData.previousClose !== null && (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Previous Close</p>
            <p className="text-2xl font-bold">{formatPrice(stockData.previousClose)}</p>
          </div>
        )}
        {stockData.open !== null && (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Open</p>
            <p className="text-2xl font-bold">{formatPrice(stockData.open)}</p>
          </div>
        )}
        {stockData.high !== null && (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Day High</p>
            <p className="text-2xl font-bold">{formatPrice(stockData.high)}</p>
          </div>
        )}
        {stockData.low !== null && (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Day Low</p>
            <p className="text-2xl font-bold">{formatPrice(stockData.low)}</p>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Price Chart</h2>
        <Suspense fallback={
          <div className="w-full h-[500px] bg-muted rounded-lg animate-pulse" />
        }>
          {isTaiwanStock ? (
            <InvestingWidget symbol={upperSymbol} />
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              Chart widget for non-Taiwan stocks coming soon
            </div>
          )}
        </Suspense>
      </div>

      {(stockData.marketCap || stockData.peRatio) && (
        <div className="grid gap-6 md:grid-cols-2">
          {stockData.marketCap && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Market Cap</p>
              <p className="text-2xl font-bold">{formatPrice(stockData.marketCap)}</p>
            </div>
          )}
          {stockData.peRatio && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">P/E Ratio</p>
              <p className="text-2xl font-bold">{stockData.peRatio.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
