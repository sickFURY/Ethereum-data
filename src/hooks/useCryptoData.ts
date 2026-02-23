import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export type Timeframe = '1D' | '1W' | '1M' | '1Y';

export interface ChartDataPoint {
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface ExchangeVolumeData {
    exchangeName: string;
    volume24h: number;
    marketShare: number;
}

interface UseCryptoDataResult {
    currentPrice: number | null;
    priceChange24h: number | null;
    priceChangePercent24h: number | null;
    marketCap: number | null;
    volume24h: number | null;
    chartData: ChartDataPoint[];
    exchangeVolumes: ExchangeVolumeData[];
    isLoading: boolean;
    error: string | null;
}

// Using CoinGecko Free API as our data source
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

export function useCryptoData(coinId: string, timeframe: Timeframe): UseCryptoDataResult {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
    const [priceChangePercent24h, setPriceChangePercent24h] = useState<number | null>(null);
    const [marketCap, setMarketCap] = useState<number | null>(null);
    const [volume24h, setVolume24h] = useState<number | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [exchangeVolumes, setExchangeVolumes] = useState<ExchangeVolumeData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            setIsLoading(true);
            setError(null);

            let fetchedLivePrice: number | null = null;

            try {
                // Determine Binance Symbol for Live Price Feed
                const binanceSymbol = coinId === 'ethereum' ? 'ETHUSDT' : coinId === 'solana' ? 'SOLUSDT' : 'XRPUSDT';

                // Fetch bulletproof live price data from Binance
                const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
                if (binanceResponse.ok) {
                    const binanceData = await binanceResponse.json();
                    fetchedLivePrice = parseFloat(binanceData.lastPrice);
                    if (isMounted) {
                        setCurrentPrice(fetchedLivePrice);
                        setPriceChange24h(parseFloat(binanceData.priceChange));
                        setPriceChangePercent24h(parseFloat(binanceData.priceChangePercent));
                        setVolume24h(parseFloat(binanceData.quoteVolume)); // 24h Volume in USDT
                    }
                }

                // Fetch market cap from CoinGecko
                const statsResponse = await fetch(
                    `${API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true`
                );

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    const coinStats = statsData[coinId];
                    if (isMounted && coinStats) {
                        setMarketCap(coinStats.usd_market_cap);
                    }
                }

                // Fetch historical data for charts
                let days = '1';
                switch (timeframe) {
                    case '1D': days = '1'; break;
                    case '1W': days = '7'; break;
                    case '1M': days = '30'; break;
                    case '1Y': days = '365'; break;
                }

                // Fetch Exchange Volume data natively to get top 7 exchanges
                const tickersResponse = await fetch(`${API_BASE_URL}/coins/${coinId}/tickers`);
                if (tickersResponse.ok) {
                    const tickersData = await tickersResponse.json();

                    const volumeByExchange = new Map<string, number>();
                    let totalVolume = 0;

                    // Group by market and sum USD volume across all pairs
                    tickersData.tickers.forEach((ticker: any) => {
                        const exchange = ticker.market.name;
                        const volumeUsd = ticker.converted_volume.usd;

                        if (volumeUsd) {
                            volumeByExchange.set(exchange, (volumeByExchange.get(exchange) || 0) + volumeUsd);
                            totalVolume += volumeUsd;
                        }
                    });

                    // Sort descending and get top 7
                    const sortedExchanges: ExchangeVolumeData[] = Array.from(volumeByExchange.entries())
                        .map(([name, volume]) => ({
                            exchangeName: name,
                            volume24h: volume,
                            marketShare: totalVolume > 0 ? (volume / totalVolume) * 100 : 0
                        }))
                        .sort((a, b) => b.volume24h - a.volume24h)
                        .slice(0, 7);

                    if (isMounted) {
                        setExchangeVolumes(sortedExchanges);
                    }
                }

                const historyResponse = await fetch(
                    `${API_BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
                );

                if (!historyResponse.ok) throw new Error(`Failed to fetch ${coinId} chart data`);

                const historyData = await historyResponse.json();

                // Format for lightweight-charts candlestick: { time, open, high, low, close }
                const formattedChartData = historyData.map((item: [number, number, number, number, number]) => {
                    const timestamp = item[0];
                    const open = item[1];
                    const high = item[2];
                    const low = item[3];
                    const close = item[4];

                    let formattedTime;
                    if (timeframe === '1D') {
                        formattedTime = Math.floor(timestamp / 1000);
                    } else {
                        formattedTime = format(new Date(timestamp), 'yyyy-MM-dd');
                    }

                    return {
                        time: formattedTime,
                        open,
                        high,
                        low,
                        close
                    };
                });

                // Deduping by time for lightweight charts requirement
                let finalChartData = formattedChartData;

                if (timeframe !== '1D') {
                    const uniqueDays = new Map();
                    formattedChartData.forEach((point: ChartDataPoint) => {
                        uniqueDays.set(point.time, point);
                    });
                    // OHLC arrays might not be perfectly deduplicated by days from standard endpoints, so we keep the latest.
                    finalChartData = Array.from(uniqueDays.values());
                }

                // Sort ascending strictly
                finalChartData.sort((a: ChartDataPoint, b: ChartDataPoint) => {
                    if (typeof a.time === 'number' && typeof b.time === 'number') return a.time - b.time;
                    return new Date(a.time).getTime() - new Date(b.time).getTime();
                });

                if (isMounted) {
                    setChartData(finalChartData);
                }

            } catch (err) {
                console.warn('API fetch failed, using fallback data.', err);
                if (isMounted) {
                    setError('Using simulated data (Live API rate limited)');

                    // Use the Binance price we just got, falling back to hardcoded mocks ONLY if Binance itself is down.
                    const livePrice = fetchedLivePrice || (coinId === 'solana' ? 145 : coinId === 'ripple' ? 0.60 : 3300);

                    if (!fetchedLivePrice) {
                        // Only set these if Binance completely failed
                        setCurrentPrice(livePrice);
                        setVolume24h(livePrice * 5000000);
                        setPriceChange24h(livePrice * 0.02);
                        setPriceChangePercent24h(2.4);
                    }

                    // Approximate Market Cap if CoinGecko failed
                    let approxSupply = 120000000;
                    if (coinId === 'ripple') approxSupply = 56000000000;
                    if (coinId === 'solana') approxSupply = 468000000;
                    setMarketCap(livePrice * approxSupply);

                    setExchangeVolumes([
                        { exchangeName: 'Binance', volume24h: livePrice * 2100000, marketShare: 42 },
                        { exchangeName: 'Coinbase Exchange', volume24h: livePrice * 800000, marketShare: 16 },
                        { exchangeName: 'Kraken', volume24h: livePrice * 550000, marketShare: 11 },
                        { exchangeName: 'KuCoin', volume24h: livePrice * 400000, marketShare: 8 },
                        { exchangeName: 'Bybit', volume24h: livePrice * 350000, marketShare: 7 },
                    ]);

                    const mockChartData: ChartDataPoint[] = [];
                    const now = new Date();
                    let currentMockPrice = livePrice;

                    const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365;
                    const timeStep = timeframe === '1D' ? 3600000 : 86400000;

                    // Generate mock OHLC data going FORWARD in time so it is strictly ascending
                    for (let i = points; i >= 0; i--) {
                        const time = new Date(now.getTime() - (i * timeStep));
                        const open = currentMockPrice;
                        // Random walk for close
                        const close = currentMockPrice + (Math.random() * 100 - 45);
                        currentMockPrice = close;

                        // Fake high/low logic
                        const high = Math.max(open, close) + (Math.random() * 20);
                        const low = Math.min(open, close) - (Math.random() * 20);

                        // Use string in 'yyyy-MM-dd' for timeframe > 1D to prevent type crashes
                        const timeValue = timeframe === '1D' ? Math.floor(time.getTime() / 1000) : format(time, 'yyyy-MM-dd');

                        mockChartData.push({
                            time: timeValue,
                            open,
                            high,
                            low,
                            close
                        });
                    }

                    setChartData(mockChartData);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchData();

        // Set up polling every 60 seconds to emulate live updates
        const interval = setInterval(fetchData, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [coinId, timeframe]);

    return {
        currentPrice,
        priceChange24h,
        priceChangePercent24h,
        marketCap,
        volume24h,
        chartData,
        exchangeVolumes,
        isLoading,
        error
    };
}
