import { AlertCircle, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Alert {
    id: string;
    time: string;
    amount: string;
    asset: string;
    from: string;
    to: string;
    type: 'transfer' | 'exchange_in' | 'exchange_out';
    isLarge: boolean;
}

interface WhaleAlertsProps {
    assetSymbol: string;
}

const generateMockAlert = (assetSymbol: string, id: number): Alert => {
    const isLarge = Math.random() > 0.8;
    const types: Array<'transfer' | 'exchange_in' | 'exchange_out'> = ['transfer', 'exchange_in', 'exchange_out'];
    const type = types[Math.floor(Math.random() * types.length)];

    let amountStr = '';
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const baseSymbol = assetSymbol.split('/')[0] || assetSymbol;

    let multiplier = 1;
    if (baseSymbol === 'ETH') multiplier = 100;
    if (baseSymbol === 'SOL') multiplier = 10000;
    if (baseSymbol === 'XRP') multiplier = 5000000;

    const baseAmount = Math.floor(Math.random() * multiplier * 5) + (isLarge ? multiplier * 15 : multiplier);
    amountStr = new Intl.NumberFormat('en-US').format(baseAmount);

    let from = 'Unknown';
    let to = 'Unknown';
    if (type === 'exchange_in') {
        from = 'Unknown Wallet';
        to = ['Binance', 'Coinbase', 'Kraken'][Math.floor(Math.random() * 3)];
    } else if (type === 'exchange_out') {
        from = ['Binance', 'Coinbase', 'Bybit'][Math.floor(Math.random() * 3)];
        to = 'Unknown Wallet';
    }

    return {
        id: `alert-${id}`,
        time: timeStr,
        amount: amountStr,
        asset: baseSymbol,
        from,
        to,
        type,
        isLarge
    };
};

export function WhaleAlerts({ assetSymbol }: WhaleAlertsProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    // Initial population
    useEffect(() => {
        const initialAlerts = Array.from({ length: 5 }).map((_, i) => generateMockAlert(assetSymbol, i));
        setAlerts(initialAlerts.reverse());
    }, [assetSymbol]);

    // Periodic new alerts
    useEffect(() => {
        let currentId = 5;
        const interval = setInterval(() => {
            currentId++;
            const newAlert = generateMockAlert(assetSymbol, currentId);
            setAlerts(current => [newAlert, ...current].slice(0, 10)); // keep last 10
        }, Math.random() * 5000 + 4000); // Random interval between 4-9s

        return () => clearInterval(interval);
    }, [assetSymbol]);

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} className="danger-text" />
                    <h3 style={{ fontSize: '1.25rem' }}>Whale Alerts</h3>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px' }}>
                    Real-time Scan
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((alert, index) => (
                    <div
                        key={alert.id}
                        className="alert-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            borderLeft: alert.isLarge ? '3px solid var(--accent-danger)' : '3px solid var(--accent-blue)',
                            animation: index === 0 ? 'slideDown 0.4s ease-out forwards' : 'none'
                        }}
                    >
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', minWidth: '60px' }}>
                            {alert.time}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: alert.isLarge ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                            {alert.type === 'transfer' ? <ArrowRightLeft size={16} /> : <AlertCircle size={16} />}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: alert.isLarge ? 'bold' : 'normal', color: alert.isLarge ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                                {alert.amount} {alert.asset}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.from}</span>
                                <ArrowRightLeft size={10} style={{ opacity: 0.5 }} />
                                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.to}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>
                {`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .alert-item {
            transition: all 0.3s ease;
          }
          
          .alert-item:hover {
            background: rgba(255,255,255,0.05) !important;
            transform: translateX(4px);
          }
        `}
            </style>
        </div>
    );
}
