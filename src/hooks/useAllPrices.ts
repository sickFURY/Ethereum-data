import { useState, useEffect } from 'react';

export interface AssetPrice {
    assetId: string;
    price: number;
}

const BINANCE_SYMBOLS: Record<string, string> = {
    ethereum: 'ETHUSDT',
    solana: 'SOLUSDT',
    ripple: 'XRPUSDT',
};

export function useAllPrices(): Record<string, number | null> {
    const [prices, setPrices] = useState<Record<string, number | null>>({
        ethereum: null,
        solana: null,
        ripple: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchAllPrices() {
            try {
                const symbols = Object.entries(BINANCE_SYMBOLS);
                const responses = await Promise.allSettled(
                    symbols.map(([, symbol]) =>
                        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
                            .then(r => r.json())
                    )
                );

                if (!isMounted) return;

                const newPrices: Record<string, number | null> = {};
                symbols.forEach(([assetId], index) => {
                    const result = responses[index];
                    if (result.status === 'fulfilled' && result.value?.price) {
                        newPrices[assetId] = parseFloat(result.value.price);
                    } else {
                        newPrices[assetId] = null;
                    }
                });

                setPrices(newPrices);
            } catch (err) {
                console.warn('Failed to fetch all prices:', err);
            }
        }

        fetchAllPrices();
        const interval = setInterval(fetchAllPrices, 30000); // Poll every 30s

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return prices;
}
