import { Brain, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarketSentimentProps {
    assetName: string;
}

export function MarketSentiment({ assetName }: MarketSentimentProps) {
    const [fearGreedIndex, setFearGreedIndex] = useState(65);
    const [bullishPercent, setBullishPercent] = useState(72);

    // Simulate dynamic sentiment updates
    useEffect(() => {
        const interval = setInterval(() => {
            setFearGreedIndex(prev => {
                const delta = Math.floor(Math.random() * 5) - 2;
                return Math.min(100, Math.max(0, prev + delta));
            });
            setBullishPercent(prev => {
                const delta = Math.floor(Math.random() * 5) - 2;
                return Math.min(100, Math.max(0, prev + delta));
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Update base sentiment based on asset
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (assetName === 'Ethereum') {
            setFearGreedIndex(72);
            setBullishPercent(78);
        } else if (assetName === 'Solana') {
            setFearGreedIndex(85);
            setBullishPercent(88);
        } else {
            setFearGreedIndex(45);
            setBullishPercent(42);
        }
    }, [assetName]);

    const getSentimentText = (index: number) => {
        if (index >= 80) return 'Extreme Greed';
        if (index >= 60) return 'Greed';
        if (index >= 40) return 'Neutral';
        if (index >= 20) return 'Fear';
        return 'Extreme Fear';
    };

    const getSentimentColor = (index: number) => {
        if (index >= 60) return 'var(--accent-success)';
        if (index >= 40) return 'var(--accent-blue)';
        return 'var(--accent-danger)';
    };

    const sentimentColor = getSentimentColor(fearGreedIndex);

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={20} className="text-gradient" />
                    <h3 style={{ fontSize: '1.25rem' }}>AI Market Sentiment</h3>
                </div>
                <div className="pulsing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-success)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)', animation: 'pulse 2s infinite' }} />
                    LIVE ANALYSIS
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1 }}>
                {/* Fear & Greed Index */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Fear & Greed Index</span>
                    <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden' }}>
                        {/* Semi-circle gauge */}
                        <div style={{
                            position: 'absolute',
                            top: '0', left: '0',
                            width: '120px', height: '120px',
                            borderRadius: '50%',
                            border: '12px solid rgba(255,255,255,0.05)',
                            borderBottomColor: 'transparent',
                            borderRightColor: 'transparent',
                            transform: 'rotate(45deg)'
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '0', left: '0',
                            width: '120px', height: '120px',
                            borderRadius: '50%',
                            border: `12px solid ${sentimentColor}`,
                            borderBottomColor: 'transparent',
                            borderRightColor: 'transparent',
                            transform: `rotate(${45 + (fearGreedIndex / 100) * 180}deg)`,
                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), border-color 1s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1', marginTop: '-10px', color: sentimentColor }}>
                        {fearGreedIndex}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: '4px', color: sentimentColor }}>
                        {getSentimentText(fearGreedIndex)}
                    </div>
                </div>

                {/* AI Social Signals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-success)' }}>
                                <TrendingUp size={14} /> Bullish
                            </span>
                            <span>{bullishPercent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${bullishPercent}%`, height: '100%', background: 'var(--accent-success)', transition: 'width 1s ease' }} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-danger)' }}>
                                <TrendingDown size={14} /> Bearish
                            </span>
                            <span>{100 - bullishPercent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${100 - bullishPercent}%`, height: '100%', background: 'var(--accent-danger)', transition: 'width 1s ease' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Activity size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                <p>
                    AI models detect unusually high accumulation of <strong style={{ color: 'var(--text-primary)' }}>{assetName}</strong> by institutional wallets over the last 24h. Social volume is up 42%.
                </p>
            </div>

            <style>
                {`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 230, 118, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
          }
        `}
            </style>
        </div>
    );
}
