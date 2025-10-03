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
            this.container.className = 'fixed top-4 right-4 z-50 space-y-3 max-w-md w-full';
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

        element.className = `${bgColor} ${textColor} p-5 rounded-xl shadow-xl border-l-4 border-white/30 transform transition-all duration-300 translate-x-full backdrop-blur-sm`;
        element.innerHTML = `
            <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 mt-0.5">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        ${icon}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold leading-tight">${notification.title}</p>
                    <p class="mt-2 text-sm opacity-95 leading-relaxed">${notification.message}</p>
                </div>
                <div class="flex-shrink-0">
                    <button onclick="NotificationService.remove('${notification.id}')" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-current opacity-80 hover:opacity-100 hover:bg-white/30 transition-all duration-200">
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
            case NotificationType.SUCCESS: return 'bg-gradient-to-r from-green-500 to-green-600';
            case NotificationType.ERROR: return 'bg-gradient-to-r from-red-500 to-red-600';
            case NotificationType.WARNING: return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
            case NotificationType.INFO: return 'bg-gradient-to-r from-blue-500 to-blue-600';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
        }
    }

    private static getTextColor(_type: NotificationType): string {
        return 'text-white';
    }

    private static getIcon(type: NotificationType): string {
        switch (type) {
            case NotificationType.SUCCESS:
                return '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
            case NotificationType.ERROR:
                return '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';
            case NotificationType.WARNING:
                return '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
            case NotificationType.INFO:
                return '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>';
            default:
                return '';
        }
    }
}

// Hacer disponible globalmente
(window as any).NotificationService = NotificationService;