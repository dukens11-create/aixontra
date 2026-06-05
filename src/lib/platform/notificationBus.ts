type NotificationEvent = {
  type: string;
  title: string;
  message: string;
  createdAt: string;
};

const listeners = new Set<(event: NotificationEvent) => void>();

export const subscribeNotificationEvents = (listener: (event: NotificationEvent) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const publishNotificationEvent = (event: NotificationEvent) => {
  listeners.forEach((listener) => listener(event));
  return event;
};
