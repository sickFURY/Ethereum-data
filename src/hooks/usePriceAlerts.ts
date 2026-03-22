import { useState, useEffect, useCallback, useRef } from 'react';

export interface PriceAlert {
    id: string;
    assetId: string;
    assetName: string;
    targetPrice: number;
    condition: 'above' | 'below';
    isActive: boolean;
    createdAt: number;
    triggeredAt?: number;
}

interface UsePriceAlertsOptions {
    /** Map of assetId -> current live price for ALL coins */
    prices: Record<string, number | null>;
    onTrigger?: (alert: PriceAlert) => void;
}

const STORAGE_KEY = 'crypto-price-alerts';

function loadAlerts(): PriceAlert[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveAlerts(alerts: PriceAlert[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function sendBrowserNotification(alert: PriceAlert, currentPrice: number) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const direction = alert.condition === 'above' ? '📈 risen above' : '📉 fallen below';
        new Notification(`${alert.assetName} Price Alert`, {
            body: `${alert.assetName} has ${direction} $${alert.targetPrice.toLocaleString()}!\nCurrent price: $${currentPrice.toLocaleString()}`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
            tag: `price-alert-${alert.id}`,
        });
    }
}

export function usePriceAlerts({ prices, onTrigger }: UsePriceAlertsOptions) {
    const [alerts, setAlerts] = useState<PriceAlert[]>(loadAlerts);
    const onTriggerRef = useRef(onTrigger);
    onTriggerRef.current = onTrigger;

    // Persist alerts to localStorage whenever they change
    useEffect(() => {
        saveAlerts(alerts);
    }, [alerts]);

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // Monitor ALL prices and fire alerts for any coin
    useEffect(() => {
        setAlerts(prev => {
            let changed = false;
            const updated = prev.map(alert => {
                if (!alert.isActive) return alert;

                const currentPrice = prices[alert.assetId];
                if (currentPrice === null || currentPrice === undefined) return alert;

                const triggered =
                    (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                    (alert.condition === 'below' && currentPrice <= alert.targetPrice);

                if (triggered) {
                    changed = true;
                    const triggeredAlert = { ...alert, isActive: false, triggeredAt: Date.now() };
                    sendBrowserNotification(triggeredAlert, currentPrice);
                    setTimeout(() => onTriggerRef.current?.(triggeredAlert), 0);
                    return triggeredAlert;
                }
                return alert;
            });
            return changed ? updated : prev;
        });
    }, [prices]);

    const addAlert = useCallback((assetId: string, assetName: string, targetPrice: number, condition: 'above' | 'below') => {
        const newAlert: PriceAlert = {
            id: crypto.randomUUID(),
            assetId,
            assetName,
            targetPrice,
            condition,
            isActive: true,
            createdAt: Date.now(),
        };
        setAlerts(prev => [newAlert, ...prev]);
    }, []);

    const removeAlert = useCallback((id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const toggleAlert = useCallback((id: string) => {
        setAlerts(prev =>
            prev.map(a => (a.id === id ? { ...a, isActive: !a.isActive } : a))
        );
    }, []);

    const clearTriggered = useCallback(() => {
        setAlerts(prev => prev.filter(a => !a.triggeredAt));
    }, []);

    const activeAlerts = alerts.filter(a => a.isActive);
    const triggeredAlerts = alerts.filter(a => !!a.triggeredAt);
    const allActiveCount = activeAlerts.length;

    return {
        alerts,
        activeAlerts,
        triggeredAlerts,
        allActiveCount,
        addAlert,
        removeAlert,
        toggleAlert,
        clearTriggered,
    };
}
