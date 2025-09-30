import { Utils } from "./utils";

export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
}

export class NotificationService {
    private static notifications: Notification[] = [];
    private static container: HTMLElement | null = null;

    static init(): void {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.container);
        }
    }

    static show(type: NotificationType, title: string, message: string, duration: number = 5000): void {
        this.init();
        
        const notification: Notification = {
            id: Utils.generateUniqueId(),
            type,
            title,
            message,
            duration
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }
    }

    static success(title: string, message: string): void {
        this.show(NotificationType.SUCCESS, title, message);
    }

    static error(title: string, message: string): void {
        this.show(NotificationType.ERROR, title, message, 8000);
    }

    static warning(title: string, message: string): void {
        this.show(NotificationType.WARNING, title, message);
    }

    static info(title: string, message: string): void {
        this.show(NotificationType.INFO, title, message);
    }

    private static renderNotification(notification: Notification): void {
        if (!this.container) return;

        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        
        const bgColor = this.getBackgroundColor(notification.type);
        const textColor = this.getTextColor(notification.type);
        const icon = this.getIcon(notification.type);

        element.className = `${bgColor} ${textColor} p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
        element.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    ${icon}
                </div>
                <div class="ml-3 w-0 flex-1">
                    <p class="text-sm font-medium">${notification.title}</p>
                    <p class="mt-1 text-xs opacity-90">${notification.message}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button onclick="NotificationService.remove('${notification.id}')" class="text-current opacity-70 hover:opacity-100">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.container.appendChild(element);

        // Animar entrada
        setTimeout(() => {
            element.classList.remove('translate-x-full');
        }, 10);
    }

    static remove(id: string): void {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.add('translate-x-full');
            setTimeout(() => {
                element.remove();
                this.notifications = this.notifications.filter(n => n.id !== id);
            }, 300);
        }
    }

    private static getBackgroundColor(type: NotificationType): string {
        switch (type) {
            case NotificationType.SUCCESS: return 'bg-green-500';
            case NotificationType.ERROR: return 'bg-red-500';
            case NotificationType.WARNING: return 'bg-yellow-500';
            case NotificationType.INFO: return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    }

    private static getTextColor(type: NotificationType): string {
        return 'text-white';
    }

    private static getIcon(type: NotificationType): string {
        switch (type) {
            case NotificationType.SUCCESS:
                return '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
            case NotificationType.ERROR:
                return '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
            case NotificationType.WARNING:
                return '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>';
            case NotificationType.INFO:
                return '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
            default:
                return '';
        }
    }
}

// Hacer disponible globalmente
(window as any).NotificationService = NotificationService;