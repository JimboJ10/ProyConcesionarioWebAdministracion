export class Utils {
    // Generar ID único
    static generateUniqueId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Filtrar array por texto
    static filterByText<T>(items: T[], searchText: string, properties: (keyof T)[]): T[] {
        if (!searchText.trim()) return items;
        
        const search = searchText.toLowerCase();
        return items.filter(item => 
            properties.some(prop => {
                const value = item[prop];
                return value && value.toString().toLowerCase().includes(search);
            })
        );
    }

    // Ordenar array por propiedad
    static sortBy<T>(items: T[], property: keyof T, ascending: boolean = true): T[] {
        return [...items].sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }

    // Paginar array
    static paginate<T>(items: T[], page: number, pageSize: number): T[] {
        const startIndex = (page - 1) * pageSize;
        return items.slice(startIndex, startIndex + pageSize);
    }

    // Calcular páginas totales
    static getTotalPages(totalItems: number, pageSize: number): number {
        return Math.ceil(totalItems / pageSize);
    }

    // Debounce para búsquedas
    static debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Copiar objeto profundo
    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    // Verificar si objeto está vacío
    static isEmpty(obj: any): boolean {
        return obj === null || obj === undefined || 
               (typeof obj === 'object' && Object.keys(obj).length === 0) ||
               (typeof obj === 'string' && obj.trim() === '');
    }
}