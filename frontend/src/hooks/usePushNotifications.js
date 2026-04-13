// usePushNotifications.js - React hook for push subscription

import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false); // FIX 1: was `true`, causing button to show "Enabling..." on mount

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);

      if (!supported) return;

      setPermission(Notification.permission);

      try {
        // FIX 2: add a timeout so navigator.serviceWorker.ready can't hang forever
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
          )
        ]);
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return { success: false, error: 'Push not supported' };

    try {
      setLoading(true);

      // Register service worker
      await navigator.serviceWorker.register('/sw.js');

      // FIX 2: same timeout guard here — prevents infinite "Enabling..." if sw.js fails
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
        )
      ]);

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setLoading(false);
        return { success: false, error: 'Permission denied' };
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to backend
      const response = await fetch('https://dablin-backend-production.up.railway.app/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      setLoading(false);
      return { success: true };

    } catch (err) {
      console.error('Subscribe error:', err);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return { success: false, error: 'Push not supported' };

    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await fetch('https://dablin-backend-production.up.railway.app/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setIsSubscribed(false);
      setLoading(false);
      return { success: true };

    } catch (err) {
      console.error('Unsubscribe error:', err);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [isSupported]);

  return {
    permission,
    isSubscribed,
    isSupported,
    loading,
    subscribe,
    unsubscribe
  };
}
