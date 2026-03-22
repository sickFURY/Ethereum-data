import { useEffect, useRef } from 'react';

export function CryptoHeatmap() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Clear previous widget if it exists
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
        {
          "dataSource": "Crypto",
          "blockSize": "market_cap_calc",
          "blockColor": "change",
          "locale": "en",
          "symbolUrl": "",
          "colorTheme": "dark",
          "hasTopBar": true,
          "isDataSetEnabled": false,
          "isZoomEnabled": true,
          "hasSymbolTooltip": true,
          "isMonoSize": false,
          "width": "100%",
          "height": "100%"
        }`;

        container.current.appendChild(script);

        const currentContainer = container.current;

        return () => {
            if (currentContainer) {
                currentContainer.innerHTML = '';
            }
        };
    }, []);

    return (
        <div
            className="tradingview-widget-container"
            ref={container}
            style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}
        >
            <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}
