import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type NotificationOptions<T extends boolean = false> = chrome.notifications.NotificationOptions<T>;

const notifications = () => browser().notifications as typeof chrome.notifications;

// Methods
export const clearNotification = (notificationId: string): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    notifications().clear(notificationId, (wasCleared) => {
        try {
            throwRuntimeError();

            resolve(wasCleared);
        } catch (e) {
            reject(e);
        }
    });
});

export const createNotification = (options: NotificationOptions, notificationId?: string): Promise<string> => new Promise<string>((resolve, reject) => {
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

    notifications().create(notificationId, {...defaultOptions, ...options}, (notificationId) => {
        try {
            throwRuntimeError();

            resolve(notificationId);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllNotification = (): Promise<object> => new Promise<object>((resolve, reject) => {
    notifications().getAll((notifications) => {
        try {
            throwRuntimeError();

            resolve(notifications);
        } catch (e) {
            reject(e);
        }
    });
});

export const getNotificationPermissionLevel = (): Promise<string> => new Promise<string>((resolve, reject) => {
    notifications().getPermissionLevel((level) => {
        try {
            throwRuntimeError();

            resolve(level);
        } catch (e) {
            reject(e);
        }
    });
});

export const updateNotification = (options: NotificationOptions, notificationId: string): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    notifications().update(notificationId, options, (wasUpdated) => {
        try {
            throwRuntimeError();

            resolve(wasUpdated);
        } catch (e) {
            reject(e);
        }
    });
});


// Custom Methods
export const isSupportNotifications = (): boolean => !!notifications();

export const clearAllNotification = async (): Promise<void> => {
    const allNotificationIds = Object.keys((await getAllNotification()));

    allNotificationIds.forEach((id: string) => clearNotification(id));
}


// Events
export const onNotificationsButtonClicked = (callback: Parameters<typeof chrome.notifications.onButtonClicked.addListener>[0]): () => void => {
    if (!isSupportNotifications()) {
        console.warn('chrome.notifications API is not supported');
        return () => ({});
    }

    return handleListener(notifications().onButtonClicked, callback)
}

export const onNotificationsClicked = (callback: Parameters<typeof chrome.notifications.onClicked.addListener>[0]): () => void => {
    if (!isSupportNotifications()) {
        console.warn('chrome.notifications API is not supported');
        return () => ({});
    }

    return handleListener(notifications().onClicked, callback)
}

export const onNotificationsClosed = (callback: Parameters<typeof chrome.notifications.onClosed.addListener>[0]): () => void => {
    if (!isSupportNotifications()) {
        console.warn('chrome.notifications API is not supported');
        return () => ({});
    }

    return handleListener(notifications().onClosed, callback)
}

export const onNotificationsPermissionLevelChanged = (callback: Parameters<typeof chrome.notifications.onPermissionLevelChanged.addListener>[0]): () => void => {
    if (!isSupportNotifications()) {
        console.warn('chrome.notifications API is not supported');
        return () => ({});
    }

    return handleListener(notifications().onPermissionLevelChanged, callback)
}
