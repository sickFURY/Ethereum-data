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

interface UseEthereumDataResult {
    currentPrice: number | null;
    priceChange24h: number | null;
    priceChangePercent24h: number | null;
    marketCap: number | null;
    volume24h: number | null;
    chartData: ChartDataPoint[];
    isLoading: boolean;
    error: string | null;
}

// Using CoinGecko Free API as our data source
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const ETH_ID = 'ethereum';

export function useEthereumData(timeframe: Timeframe): UseEthereumDataResult {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
    const [priceChangePercent24h, setPriceChangePercent24h] = useState<number | null>(null);
    const [marketCap, setMarketCap] = useState<number | null>(null);
    const [volume24h, setVolume24h] = useState<number | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch current stats
                const statsResponse = await fetch(
                    `${API_BASE_URL}/simple/price?ids=${ETH_ID}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
                );

                if (!statsResponse.ok) throw new Error('Failed to fetch Ethereum stats');

                const statsData = await statsResponse.json();
                const ethStats = statsData[ETH_ID];

                if (isMounted) {
                    setCurrentPrice(ethStats.usd);
                    setMarketCap(ethStats.usd_market_cap);
                    setVolume24h(ethStats.usd_24h_vol);
                    // CoinGecko provides change directly 
                    const current = ethStats.usd;
                    const changePercent = ethStats.usd_24h_change;
                    // Calculate absolute change based on percentage
                    const previousPrice = current / (1 + (changePercent / 100));
                    setPriceChange24h(current - previousPrice);
                    setPriceChangePercent24h(changePercent);
                }

                // Fetch historical data for charts
                let days = '1';
                switch (timeframe) {
                    case '1D': days = '1'; break;
                    case '1W': days = '7'; break;
                    case '1M': days = '30'; break;
                    case '1Y': days = '365'; break;
                }

                const historyResponse = await fetch(
                    `${API_BASE_URL}/coins/${ETH_ID}/ohlc?vs_currency=usd&days=${days}`
                );

                if (!historyResponse.ok) throw new Error('Failed to fetch Ethereum chart data');

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
                    setCurrentPrice(3421.50);
                    setMarketCap(412500000000);
                    setVolume24h(18200000000);
                    setPriceChange24h(82.11);
                    setPriceChangePercent24h(2.4);

                    const mockChartData: ChartDataPoint[] = [];
                    const now = new Date();
                    let currentMockPrice = 3300;

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
    }, [timeframe]);

    return {
        currentPrice,
        priceChange24h,
        priceChangePercent24h,
        marketCap,
        volume24h,
        chartData,
        isLoading,
        error
    };
}
