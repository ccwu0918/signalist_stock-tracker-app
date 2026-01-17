import { WatchlistItem } from '@/database/models/watchlist.model';
import TradingViewWidget from '@/components/TradingViewWidget';
import YahooFinanceChart from '@/components/YahooFinanceChart';
import WatchlistButton from '@/components/WatchlistButton';
import { getStocksDetails } from '@/lib/actions/finnhub.actions';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';

function getTradingViewSymbol(raw: string) {
  const symbol = raw.toUpperCase().trim();
  if (symbol.endsWith('.TW')) {
    const base = symbol.replace('.TW', '');
    return `TWSE:${base}`;
  }
  return symbol;
}

export default async function StockDetails({ 
  params 
}: { 
  params: Promise<{ symbol: string }> 
}) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  const isTaiwanStock = upperSymbol.endsWith('.TW');
  const tvSymbol = getTradingViewSymbol(upperSymbol);
  const scriptUrl = 'https://s3.tradingview.com/external-embedding/embed-widget-';

  const stockData = await getStocksDetails(upperSymbol);
  const watchlist = await getUserWatchlist();

  const isInWatchlist = watchlist.some(
    (item: WatchlistItem) => item.symbol === upperSymbol
  );

  const hasData = Boolean(stockData);

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* 左側：圖表 */}
        <div className="flex flex-col gap-6">
          {/* Symbol Info - TradingView 對所有市場都支援 */}
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(tvSymbol)}
            height={170}
          />

          {/* 主要圖表：台股用 Yahoo Finance，其他用 TradingView */}
          {isTaiwanStock ? (
            <>
              <YahooFinanceChart symbol={upperSymbol} height={600} />
              <div className="border rounded-lg p-4 bg-gray-900">
                <p className="text-sm text-gray-400">
                  台股圖表由 Yahoo Finance 提供。
                  <a 
                    href={`https://finance.yahoo.com/quote/${upperSymbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline ml-1"
                  >
                    查看完整資料 →
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <TradingViewWidget
                scriptUrl={`${scriptUrl}advanced-chart.js`}
                config={{
                  ...CANDLE_CHART_WIDGET_CONFIG(tvSymbol),
                  symbol: tvSymbol,
                }}
                className="custom-chart"
                height={600}
              />
              <TradingViewWidget
                scriptUrl={`${scriptUrl}advanced-chart.js`}
                config={{
                  ...BASELINE_WIDGET_CONFIG(tvSymbol),
                  symbol: tvSymbol,
                }}
                className="custom-chart"
                height={600}
              />
            </>
          )}
        </div>

        {/* 右側 */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <WatchlistButton
              symbol={upperSymbol}
              company={stockData?.company ?? upperSymbol}
              isInWatchlist={isInWatchlist}
              type="button"
            />
          </div>

          {hasData ? (
            <>
              <TradingViewWidget
                scriptUrl={`${scriptUrl}technical-analysis.js`}
                config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(tvSymbol)}
                height={400}
              />
              <TradingViewWidget
                scriptUrl={`${scriptUrl}company-profile.js`}
                config={COMPANY_PROFILE_WIDGET_CONFIG(tvSymbol)}
                height={440}
              />
              <TradingViewWidget
                scriptUrl={`${scriptUrl}financials.js`}
                config={COMPANY_FINANCIALS_WIDGET_CONFIG(tvSymbol)}
                height={464}
              />
            </>
          ) : (
            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="text-lg font-semibold">
                Limited data for {upperSymbol}
              </h2>
              <p className="text-sm text-muted-foreground">
                Finnhub does not provide fundamentals for this symbol on your
                current plan. 圖表資料由 {isTaiwanStock ? 'Yahoo Finance' : 'TradingView'} 提供。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}