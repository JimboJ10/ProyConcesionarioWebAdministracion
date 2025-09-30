export abstract class BaseController<T> {
    protected items: T[] = [];

    abstract create(item: T): void;
    abstract update(id: string, item: T): boolean;
    abstract delete(id: string): boolean;
    abstract getById(id: string): T | undefined;
    abstract getAll(): T[];

    protected generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    getCount(): number {
        return this.items.length;
    }

    clear(): void {
        this.items = [];
    }
}