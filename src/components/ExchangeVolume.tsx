import { BarChart2 } from 'lucide-react';
import type { ExchangeVolumeData } from '../hooks/useCryptoData';

interface Props {
    data: ExchangeVolumeData[];
    assetName: string;
}

export function ExchangeVolume({ data, assetName }: Props) {
    const formatVolume = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 1,
            notation: 'compact'
        }).format(val);
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chart-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <BarChart2 size={20} className="text-gradient" />
                    24h Exchange Volume ({assetName})
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, marginTop: '24px', overflowY: 'auto' }}>
                {data.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
                        Loading exchange data...
                    </div>
                ) : (
                    data.map((exchange, idx) => (
                        <div key={exchange.exchangeName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                                    <span style={{ color: 'var(--text-muted)', marginRight: '10px', fontSize: '0.8rem' }}>{idx + 1}</span>
                                    {exchange.exchangeName}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                        {formatVolume(exchange.volume24h)}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>
                                        {exchange.marketShare.toFixed(1)}% Market Share
                                    </span>
                                </div>
                            </div>
                            <div className="progress-bar-bg" style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        height: '100%',
                                        width: `${Math.min(exchange.marketShare, 100)}%`,
                                        background: 'var(--gradient-primary)',
                                        borderRadius: '12px',
                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
