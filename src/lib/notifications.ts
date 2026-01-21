import { NotificationConfig } from '../components/NotificationModal';
import { Event } from '../types/event';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

const calculateNotificationTime = (
  referenceTime: Date,
  notification: NotificationConfig
): Date => {
  const notificationTime = new Date(referenceTime);

  if (notification.type === 'at_time') {
    return notificationTime;
  }

  if (notification.type === 'before_10min') {
    notificationTime.setMinutes(notificationTime.getMinutes() - 10);
    return notificationTime;
  }

  if (notification.type === 'before_1hour') {
    notificationTime.setHours(notificationTime.getHours() - 1);
    return notificationTime;
  }

  if (notification.type === 'custom' && notification.customValue && notification.customUnit) {
    const value = notification.customValue;
    switch (notification.customUnit) {
      case 'minute':
        notificationTime.setMinutes(notificationTime.getMinutes() - value);
        break;
      case 'hour':
        notificationTime.setHours(notificationTime.getHours() - value);
        break;
      case 'day':
        notificationTime.setDate(notificationTime.getDate() - value);
        break;
      case 'week':
        notificationTime.setDate(notificationTime.getDate() - value * 7);
        break;
    }
    return notificationTime;
  }

  return notificationTime;
};

export const scheduleEventNotifications = async (event: Event) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  const notifications = (event as any).notifications as NotificationConfig[] | undefined;
  if (!notifications || notifications.length === 0) {
    return;
  }

  for (const notification of notifications) {
    const referenceTime = notification.referenceTime === 'start'
      ? new Date(event.start_at)
      : new Date(event.end_at);

    const notificationTime = calculateNotificationTime(referenceTime, notification);
    const now = new Date();

    if (notificationTime <= now) {
      continue;
    }

    const delay = notificationTime.getTime() - now.getTime();

    setTimeout(() => {
      showNotification(event);
    }, Math.min(delay, 2147483647));
  }
};

export const showNotification = (event: Event) => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const title = event.title;
  const body = `${new Date(event.start_at).toLocaleString('ja-JP')}`;
  const options: NotificationOptions = {
    body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: event.id,
    requireInteraction: false,
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  } else {
    new Notification(title, options);
  }
};

export const cancelEventNotifications = (eventId: string) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.getNotifications({ tag: eventId }).then((notifications) => {
        notifications.forEach((notification) => notification.close());
      });
    });
  }
};
