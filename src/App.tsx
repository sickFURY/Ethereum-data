import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Clock, Wallet, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import type { Timeframe } from './hooks/useCryptoData';
import { useCryptoData } from './hooks/useCryptoData';

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  tvSymbol: string;
}

const SUPPORTED_ASSETS: CryptoAsset[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH/USD', tvSymbol: 'BINANCE:ETHUSDT' },
  { id: 'solana', name: 'Solana', symbol: 'SOL/USD', tvSymbol: 'BINANCE:SOLUSDT' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP/USD', tvSymbol: 'BINANCE:XRPUSDT' },
];
import { AdvancedChart } from './components/AdvancedChart';
import { CryptoHeatmap } from './components/CryptoHeatmap';
import { ExchangeVolume } from './components/ExchangeVolume';

type DashboardTab = 'dashboard' | 'heatmap';

function App() {
  const [timeframe] = useState<Timeframe>('1W');
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [activeAsset, setActiveAsset] = useState<CryptoAsset>(SUPPORTED_ASSETS[0]);
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  const {
    currentPrice,
    priceChange24h,
    priceChangePercent24h,
    marketCap,
    volume24h,
    exchangeVolumes,
    isLoading
  } = useCryptoData(activeAsset.id, timeframe);

  const formatCurrency = (value: number | null, maximumFractionDigits = 2) => {
    if (value === null) return '---';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits
    }).format(value);
  };

  const formatCompactNumber = (number: number | null) => {
    if (number === null) return '---';
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(number);
  };

  return (
    <div className="app-container">
      <div className="glow-bg" />

      {/* Sidebar/Navigation (simplified for dashboard) */}
      <aside style={{ width: '80px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '32px' }}>
        <div style={{ padding: '12px', background: 'var(--gradient-primary)', borderRadius: '12px', color: 'white' }}>
          <Activity size={24} />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--text-secondary)' }}>
          <BarChart3 size={24} style={{ color: 'var(--text-primary)' }} />
          <Wallet size={24} />
          <Clock size={24} />
        </nav>
      </aside>

      <main className="main-content">
        <div className="tabs-nav animate-fade-in">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            Market Heatmap
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            <header className="dashboard-header animate-fade-in">
              <div>
                <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>{activeAsset.name} Analytics</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Live market data and technical charts</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Asset Selector Menu */}
                <div className="timeframe-selector">
                  {SUPPORTED_ASSETS.map(asset => (
                    <button
                      key={asset.id}
                      className={`timeframe-btn ${activeAsset.id === asset.id ? 'active' : ''}`}
                      onClick={() => setActiveAsset(asset)}
                    >
                      {asset.name}
                    </button>
                  ))}
                </div>

                <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{activeAsset.symbol}</span>
                  <span className="stat-value text-gradient">
                    {isLoading && !currentPrice ? <Loader2 className="animate-spin" size={24} /> : formatCurrency(currentPrice)}
                  </span>
                </div>
              </div>
            </header>

            {/* Stats Row */}
            <section className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="glass-panel stat-card">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">${formatCompactNumber(marketCap)}</span>
                {priceChangePercent24h !== null && (
                  <div className={`stat-change ${priceChangePercent24h >= 0 ? 'success-text' : 'danger-text'}`}>
                    {priceChangePercent24h >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{Math.abs(priceChangePercent24h).toFixed(2)}%</span>
                  </div>
                )}
              </div>

              <div className="glass-panel stat-card">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">${formatCompactNumber(volume24h)}</span>
                <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>
                  <span>Past 24 hours</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <span className="stat-label">24h Change (USD)</span>
                <span className="stat-value">{priceChange24h !== null ? formatCurrency(Math.abs(priceChange24h)) : '---'}</span>
                {priceChange24h !== null && (
                  <div className={`stat-change ${priceChange24h >= 0 ? 'success-text' : 'danger-text'}`}>
                    {priceChange24h >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{priceChange24h >= 0 ? 'Up' : 'Down'}</span>
                  </div>
                )}
              </div>

              <div className="glass-panel stat-card">
                <span className="stat-label">Data Source</span>
                <span className="stat-value" style={{ fontSize: '1.25rem' }}>CoinGecko</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Public API</span>
              </div>
            </section>

            {/* Charts Area */}
            <section
              className={`charts-grid ${!isChartFullscreen ? 'animate-fade-in' : ''}`}
              style={{
                animationDelay: '0.2s',
                ...(isChartFullscreen ? { transform: 'none', zIndex: 9999, position: 'relative' } : {})
              }}
            >
              <div className={`glass-panel chart-container ${isChartFullscreen ? 'chart-fullscreen' : ''}`}>
                {!isChartFullscreen ? (
                  <div className="chart-header">
                    <h3>Interactive Pro Chart</h3>
                    <button
                      className="icon-btn"
                      onClick={() => setIsChartFullscreen(true)}
                      title="Enter Fullscreen"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="icon-btn fullscreen-close-btn"
                    onClick={() => setIsChartFullscreen(false)}
                    title="Exit Fullscreen"
                  >
                    <Minimize2 size={24} />
                  </button>
                )}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <AdvancedChart symbol={activeAsset.tvSymbol} theme="dark" />
                </div>
              </div>

              <ExchangeVolume data={exchangeVolumes} assetName={activeAsset.name} />
            </section>
          </>
        ) : (
          <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CryptoHeatmap />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
