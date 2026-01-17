import { notFound } from 'next/navigation';
import { WatchlistItem } from '@/database/models/watchlist.model';
import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = params; // 這裡不用 await
  const upperSymbol = symbol.toUpperCase();
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  const stockData = await getStocksDetails(upperSymbol);
  const watchlist = await getUserWatchlist();

  const isInWatchlist = watchlist.some(
    (item: WatchlistItem) => item.symbol === upperSymbol
  );

  // ✅ 不再直接 notFound，而是顯示「無法取得數據」畫面
  if (!stockData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            No market data available for {upperSymbol}
          </h1>
          <p className="text-muted-foreground">
            Your current data provider does not grant access to this symbol.
            You can still keep it in your watchlist, but price and metrics
            will not be shown.
          </p>
          <div className="flex justify-center">
            <WatchlistButton
              symbol={upperSymbol}
              company={upperSymbol}
              isInWatchlist={isInWatchlist}
              type="button"
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ 有資料時，維持原本完整詳情頁
  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(upperSymbol)}
            height={170}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(upperSymbol)}
            className="custom-chart"
            height={600}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(upperSymbol)}
            className="custom-chart"
            height={600}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <WatchlistButton
              symbol={upperSymbol}
              company={stockData.company}
              isInWatchlist={isInWatchlist}
              type="button"
            />
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upperSymbol)}
            height={400}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(upperSymbol)}
            height={440}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(upperSymbol)}
            height={464}
          />
        </div>
      </section>
    </div>
  );
}
