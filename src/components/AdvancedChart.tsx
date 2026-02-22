import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        TradingView: any;
    }
}

interface ChartProps {
    symbol?: string;
    theme?: 'light' | 'dark';
}

export const AdvancedChart: React.FC<ChartProps> = ({
    symbol = "BINANCE:ETHUSD",
    theme = "dark"
}) => {
    const containerId = 'tv_chart_container';
    const hasInjected = useRef(false);

    useEffect(() => {
        const injectChart = () => {
            if (window.TradingView && window.TradingView.widget) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: "1D",
                    timezone: "Etc/UTC",
                    theme: theme,
                    style: "1",
                    locale: "en",
                    enable_publishing: false,
                    backgroundColor: theme === 'dark' ? "rgba(11, 14, 20, 1)" : "#ffffff", // Match our app background
                    gridColor: theme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    hide_top_toolbar: false,
                    hide_legend: false,
                    save_image: false,
                    container_id: containerId,
                    toolbar_bg: theme === 'dark' ? "rgba(11, 14, 20, 1)" : "#f1f3f6",
                    withdateranges: true,
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    show_popup_button: true,
                    popup_width: "1000",
                    popup_height: "650",
                    details: true,
                    hotlist: true,
                    calendar: false,
                    studies: [
                        "MASimple@tv-basicstudies", // Add default SMA
                        "Volume@tv-basicstudies" // Add Volume
                    ],
                });
            }
        };

        if (!document.getElementById('tradingview-widget-loading-script') && !hasInjected.current) {
            hasInjected.current = true;
            const script = document.createElement('script');
            script.id = 'tradingview-widget-loading-script';
            script.src = 'https://s3.tradingview.com/tv.js';
            script.type = 'text/javascript';
            script.onload = injectChart;
            document.head.appendChild(script);
        } else {
            injectChart();
        }

        return () => {
            // Cleanup: removing the chart is handled by the widget natively on dismount if replacing
            // But we can clear the container HTML to be safe
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [symbol, theme]);

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex' }}>
            <div id={containerId} style={{ height: '100%', width: '100%' }} />
        </div>
    );
};
