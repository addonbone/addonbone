import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

type NotificationOptions<T extends boolean = false> = chrome.notifications.NotificationOptions<T>;

const notifications = browser().notifications;

export const isSupportNotifications = () => !!notifications;

export const createNotification = (options: NotificationOptions, notificationId?: string) => new Promise<string>((resolve, reject) => {
    const defaultOptions: NotificationOptions<true> = {
        type: 'basic',
        priority: 1,
        title: '',
        message: '',
        iconUrl: '',
    };

    if (typeof notificationId !== 'string') {
        notificationId = Date.now().toString();
    }

    notifications.create(notificationId, {...defaultOptions, ...options}, (notificationId) => {
        try {
            throwRuntimeError();

            resolve(notificationId);
        } catch (e) {
            reject(e);
        }
    });
});

export const updateNotification = (options: NotificationOptions, notificationId: string) => new Promise<boolean>((resolve, reject) => {
    notifications.update(notificationId, options, (wasUpdated) => {
        try {
            throwRuntimeError();

            resolve(wasUpdated);
        } catch (e) {
            reject(e);
        }
    });
});

export const clearNotification = (notificationId: string): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    notifications.clear(notificationId, (wasCleared) => {
        try {
            throwRuntimeError();

            resolve(wasCleared);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllNotification = (): Promise<object> => new Promise<object>((resolve, reject) => {
    notifications.getAll((notifications) => {
        try {
            throwRuntimeError();

            resolve(notifications);
        } catch (e) {
            reject(e);
        }
    });
});

export const clearAllNotification = async (): Promise<void> => {
    const allNotificationIds = Object.keys((await getAllNotification()));

    allNotificationIds.forEach((id: string) => clearNotification(id));
}

export const getNotificationPermissionLevel = (): Promise<string> => new Promise<string>((resolve, reject) => {
    notifications.getPermissionLevel((level) => {
        try {
            throwRuntimeError();

            resolve(level);
        } catch (e) {
            reject(e);
        }
    });
});

export const onNotificationsClicked = (callback: Parameters<typeof notifications.onClicked.addListener>[0]) => {
    if (!isSupportNotifications()) return;

    notifications.onClicked.addListener(callback);

    return () => notifications.onClicked.removeListener(callback);
}

export const onNotificationsClosed = (callback: Parameters<typeof notifications.onClosed.addListener>[0]) => {
    if (!isSupportNotifications()) return;

    notifications.onClosed.addListener(callback);

    return () => notifications.onClosed.removeListener(callback);
}

export const onNotificationsButtonClicked = (callback: Parameters<typeof notifications.onButtonClicked.addListener>[0]) => {
    if (!isSupportNotifications()) return;

    notifications.onButtonClicked.addListener(callback);

    return () => notifications.onButtonClicked.removeListener(callback);
}

export const onNotificationsPermissionLevelChanged = (callback: Parameters<typeof notifications.onPermissionLevelChanged.addListener>[0]) => {
    if (!isSupportNotifications()) return;

    notifications.onPermissionLevelChanged.addListener(callback);

    return () => notifications.onPermissionLevelChanged.removeListener(callback);
}
