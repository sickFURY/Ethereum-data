import { useState, useEffect } from 'react';
import { Bell, BellRing, Plus, Trash2, ToggleLeft, ToggleRight, X, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import type { PriceAlert } from '../hooks/usePriceAlerts';

interface CryptoAssetInfo {
    id: string;
    name: string;
    symbol: string;
}

interface PriceAlertsProps {
    prices: Record<string, number | null>;
    assets: CryptoAssetInfo[];
}

interface Toast {
    id: string;
    alert: PriceAlert;
    currentPrice: number;
}

export function PriceAlerts({ prices, assets }: PriceAlertsProps) {
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState<'above' | 'below'>('above');
    const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const {
        activeAlerts,
        triggeredAlerts,
        addAlert,
        removeAlert,
        toggleAlert,
        clearTriggered,
    } = usePriceAlerts({
        prices,
        onTrigger: (alert) => {
            const price = prices[alert.assetId] ?? 0;
            const toast: Toast = { id: alert.id, alert, currentPrice: price };
            setToasts(prev => [toast, ...prev]);
        },
    });

    // Auto-dismiss toasts after 5 seconds
    useEffect(() => {
        if (toasts.length === 0) return;
        const timer = setTimeout(() => {
            setToasts(prev => prev.slice(0, -1));
        }, 5000);
        return () => clearTimeout(timer);
    }, [toasts]);

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
    const selectedPrice = prices[selectedAssetId] ?? null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(targetPrice);
        if (isNaN(price) || price <= 0 || !selectedAsset) return;
        addAlert(selectedAsset.id, selectedAsset.name, price, condition);
        setTargetPrice('');
    };

    const formatPrice = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="price-alerts-container animate-fade-in">
            {/* Toast Notifications */}
            <div className="alert-toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className="alert-toast glass-panel">
                        <div className="alert-toast-icon">
                            <BellRing size={20} />
                        </div>
                        <div className="alert-toast-content">
                            <strong>{toast.alert.assetName} Alert Triggered!</strong>
                            <span>
                                Price {toast.alert.condition === 'above' ? 'rose above' : 'fell below'}{' '}
                                {formatPrice(toast.alert.targetPrice)}
                            </span>
                        </div>
                        <button className="alert-toast-close" onClick={() => dismissToast(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="price-alerts-header">
                <div>
                    <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
                        <Bell size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Price Alerts
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Set custom price targets for any coin and get notified instantly
                    </p>
                </div>
                {/* Live prices for all coins */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {assets.map(asset => (
                        <div key={asset.id} className="glass-panel alert-current-price" style={{ minWidth: '120px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{asset.name}</span>
                            <span className="text-gradient" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                                {prices[asset.id] !== null ? formatPrice(prices[asset.id]!) : '---'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Alert Form */}
            <form className="glass-panel alert-form" onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>
                    <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Create New Alert
                </h3>
                <div className="alert-form-row">
                    <div className="alert-form-group">
                        <label className="alert-form-label">Coin</label>
                        <select
                            className="alert-select"
                            value={selectedAssetId}
                            onChange={e => setSelectedAssetId(e.target.value)}
                        >
                            {assets.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                    {asset.name} ({asset.symbol})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="alert-form-group">
                        <label className="alert-form-label">Condition</label>
                        <select
                            className="alert-select"
                            value={condition}
                            onChange={e => setCondition(e.target.value as 'above' | 'below')}
                        >
                            <option value="above">Price goes above</option>
                            <option value="below">Price goes below</option>
                        </select>
                    </div>
                    <div className="alert-form-group" style={{ flex: 2 }}>
                        <label className="alert-form-label">
                            Target Price (USD)
                            {selectedPrice !== null && (
                                <span style={{ color: 'var(--text-muted)', marginLeft: '8px', textTransform: 'none', letterSpacing: 'normal' }}>
                                    Current: {formatPrice(selectedPrice)}
                                </span>
                            )}
                        </label>
                        <input
                            type="number"
                            className="alert-input"
                            placeholder={selectedPrice ? `e.g. ${Math.round(selectedPrice * 1.05)}` : 'Enter price...'}
                            value={targetPrice}
                            onChange={e => setTargetPrice(e.target.value)}
                            min="0"
                            step="any"
                            required
                        />
                    </div>
                    <button type="submit" className="alert-submit-btn">
                        <Bell size={18} />
                        Set Alert
                    </button>
                </div>
            </form>

            {/* Alerts Grid */}
            <div className="alerts-grid">
                {/* Active Alerts */}
                <div className="alerts-section">
                    <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
                        Active Alerts
                        {activeAlerts.length > 0 && (
                            <span className="alert-count-badge">{activeAlerts.length}</span>
                        )}
                    </h3>
                    {activeAlerts.length === 0 ? (
                        <div className="glass-panel alert-empty">
                            <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No active alerts</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create one above to get started!</p>
                        </div>
                    ) : (
                        <div className="alert-list">
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className="glass-panel alert-card alert-card-active">
                                    <div className="alert-card-icon">
                                        {alert.condition === 'above' ? (
                                            <ArrowUpRight size={20} className="success-text" />
                                        ) : (
                                            <ArrowDownRight size={20} className="danger-text" />
                                        )}
                                    </div>
                                    <div className="alert-card-info">
                                        <span className="alert-card-asset">{alert.assetName}</span>
                                        <span className="alert-card-condition">
                                            {alert.condition === 'above' ? 'Above' : 'Below'}
                                        </span>
                                        <span className="alert-card-price">{formatPrice(alert.targetPrice)}</span>
                                        <span className="alert-card-time">
                                            <Clock size={12} /> {formatTime(alert.createdAt)}
                                        </span>
                                    </div>
                                    <div className="alert-card-actions">
                                        <button
                                            className="alert-action-btn"
                                            onClick={() => toggleAlert(alert.id)}
                                            title={alert.isActive ? 'Pause alert' : 'Resume alert'}
                                        >
                                            {alert.isActive ? <ToggleRight size={22} className="success-text" /> : <ToggleLeft size={22} />}
                                        </button>
                                        <button
                                            className="alert-action-btn alert-delete-btn"
                                            onClick={() => removeAlert(alert.id)}
                                            title="Delete alert"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Triggered Alerts */}
                <div className="alerts-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ color: 'var(--text-primary)' }}>
                            Triggered Alerts
                            {triggeredAlerts.length > 0 && (
                                <span className="alert-count-badge triggered">{triggeredAlerts.length}</span>
                            )}
                        </h3>
                        {triggeredAlerts.length > 0 && (
                            <button className="alert-clear-btn" onClick={clearTriggered}>
                                Clear All
                            </button>
                        )}
                    </div>
                    {triggeredAlerts.length === 0 ? (
                        <div className="glass-panel alert-empty">
                            <BellRing size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No triggered alerts yet</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Alerts will appear here once triggered</p>
                        </div>
                    ) : (
                        <div className="alert-list">
                            {triggeredAlerts.map(alert => (
                                <div key={alert.id} className="glass-panel alert-card alert-card-triggered">
                                    <div className="alert-card-icon">
                                        <BellRing size={20} style={{ color: 'var(--accent-blue)' }} />
                                    </div>
                                    <div className="alert-card-info">
                                        <span className="alert-card-asset">{alert.assetName}</span>
                                        <span className="alert-card-condition" style={{ opacity: 0.7 }}>
                                            {alert.condition === 'above' ? 'Above' : 'Below'} {formatPrice(alert.targetPrice)}
                                        </span>
                                        <span className="alert-card-time">
                                            <Clock size={12} /> Triggered {alert.triggeredAt ? formatTime(alert.triggeredAt) : ''}
                                        </span>
                                    </div>
                                    <button
                                        className="alert-action-btn alert-delete-btn"
                                        onClick={() => removeAlert(alert.id)}
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
