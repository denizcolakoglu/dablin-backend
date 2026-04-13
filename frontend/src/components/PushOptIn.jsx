// PushOptIn.jsx - Notification opt-in component

import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushOptIn() {
  const { permission, isSubscribed, isSupported, loading, subscribe, unsubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('push_prompt_dismissed') === 'true';
  });

  // Don't show if not supported, already subscribed, or dismissed
  if (!isSupported || isSubscribed || dismissed || permission === 'denied') {
    return null;
  }

  const handleSubscribe = async () => {
    const result = await subscribe();
    if (result.success) {
      // Optionally show a success message
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push_prompt_dismissed', 'true');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#fff',
      border: '1px solid #dde8dd',
      borderRadius: '14px',
      padding: '20px',
      maxWidth: '320px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      zIndex: 1000,
      fontFamily: "'Roboto', sans-serif"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2e1a' }}>
          Stay updated
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#a09a94',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>
      <p style={{ fontSize: '13px', color: '#6b6560', margin: '0 0 16px', lineHeight: 1.5 }}>
        Get notified about new SEO tips, AI visibility updates, and product news.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#2d7a3a',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Enabling...' : 'Enable notifications'}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '10px 16px',
            background: '#f5f5f5',
            color: '#6b6560',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
