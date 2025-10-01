export class Formatters {
    // Formatear precio en euros
    static formatPrice(price: number): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    // Formatear fecha
    static formatDate(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    // Formatear fecha y hora
    static formatDateTime(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Formatear teléfono
    static formatPhone(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 9) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
        }
        return phone;
    }

    // Formatear NIF
    static formatNIF(nif: string): string {
        const cleaned = nif.replace(/\s/g, '').toUpperCase();
        if (cleaned.length === 9) {
            return cleaned.replace(/(\d{8})([A-Z])/, '$1-$2');
        }
        return nif;
    }

    // Formatear número de chasis
    static formatVIN(vin: string): string {
        return vin.toUpperCase().replace(/(.{4})/g, '$1 ').trim();
    }

    // Capitalizar primera letra
    static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    // Formatear porcentaje
    static formatPercentage(value: number): string {
        return `${value}%`;
    }
}