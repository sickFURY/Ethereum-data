import { ExternalLink, Flame, Activity, TrendingDown, TrendingUp } from 'lucide-react';

interface Props {
    assetName: string;
}

export function LiquidationIntel({ assetName }: Props) {
    // Mock live data for the dashboard (CoinGlass API requires auth/paid limits in browser)
    // This gives the user a beautifully styled proxy of what they would see on Coinglass

    const isEth = assetName.toLowerCase() === 'ethereum';
    const isSol = assetName.toLowerCase() === 'solana';

    // Dynamic mock values based on asset
    const totalLiq = isEth ? '$24.5M' : isSol ? '$18.2M' : '$8.4M';
    const longLiq = isEth ? '$18.1M' : isSol ? '$12.0M' : '$2.1M';
    const shortLiq = isEth ? '$6.4M' : isSol ? '$6.2M' : '$6.3M';
    const longRatio = isEth ? 73.8 : isSol ? 65.9 : 25.0;

    const mapUrl = `https://www.coinglass.com/pro/futures/LiquidationHeatMap`;

    return (
        <div className="animate-fade-in" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '24px 0',
            height: '100%',
            overflowY: 'auto'
        }}>

            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

                {/* Total Liquidations */}
                <div className="glass-panel stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                    <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={18} color="#ef4444" />
                        24H Total Liquidations ({assetName})
                    </div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{totalLiq}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                            <TrendingDown size={14} /> Longs: {longLiq}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                            <TrendingUp size={14} /> Shorts: {shortLiq}
                        </div>
                    </div>
                </div>

                {/* Long/Short Ratio */}
                <div className="glass-panel stat-card">
                    <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} className="text-gradient" />
                        Long / Short Ratio
                    </div>
                    <div className="stat-value" style={{ fontSize: '2rem' }}>
                        {longRatio.toFixed(1)}% <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Longs</span>
                    </div>

                    <div style={{ marginTop: '16px', width: '100%', height: '8px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${longRatio}%`, height: '100%', background: '#ef4444', transition: 'width 1s ease' }} />
                        <div style={{ width: `${100 - longRatio}%`, height: '100%', background: '#10b981', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Longs ({longRatio}%)</span>
                        <span>Shorts ({(100 - longRatio).toFixed(1)}%)</span>
                    </div>
                </div>
            </div>

            {/* Main Heatmap Portal Area */}
            <div className="glass-panel" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '400px'
            }}>
                {/* Decorative background blur */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Flame size={32} className="text-gradient" />
                    </div>

                    <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                        Enterprise Liquidation Heatmap
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>
                        High-resolution liquidation heatmaps require massive Order Book aggregation across all major derivatives exchanges and cannot be embedded natively.
                    </p>

                    <button
                        onClick={() => window.open(mapUrl, '_blank')}
                        style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 8px 16px rgba(56, 189, 248, 0.2)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Launch CoinGlass Heatmap <ExternalLink size={20} />
                    </button>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '24px', opacity: 0.7 }}>
                        *Opens live Coinglass Pro map in a new secure tab.
                    </p>
                </div>
            </div>

        </div>
    );
}
