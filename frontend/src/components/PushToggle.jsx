// PushToggle.jsx - Toggle for settings page

import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushToggle() {
  const { permission, isSubscribed, isSupported, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div style={{ fontSize: '13px', color: '#a09a94' }}>
        Push notifications are not supported in this browser.
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div style={{ fontSize: '13px', color: '#d85a30' }}>
        Notifications are blocked. Enable them in your browser settings.
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2e1a' }}>
          Push notifications
        </div>
        <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '2px' }}>
          Get notified about updates and tips
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          border: 'none',
          background: isSubscribed ? '#2d7a3a' : '#dde8dd',
          cursor: loading ? 'wait' : 'pointer',
          position: 'relative',
          transition: 'background 0.2s'
        }}
      >
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '3px',
          left: isSubscribed ? '23px' : '3px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
        }} />
      </button>
    </div>
  );
}
