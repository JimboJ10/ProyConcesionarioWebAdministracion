import { BaseController } from './BaseController';
import { Stock } from '../Entidades/Stock';

export class StockController extends BaseController<Stock> {
    create(stock: Stock): void {
        stock.id = this.generateId();
        this.items.push(stock);
    }

    update(id: string, stockData: Stock): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const updatedStock = new Stock(
                id,
                stockData.numeroChasis,
                stockData.automovilId,
                stockData.concesionarioId,
                stockData.ubicacion,
                stockData.color,
                stockData.kilometraje,
                stockData.servicioOficialId
            );
            // Mantener datos originales
            updatedStock.fechaIngreso = this.items[index].fechaIngreso;
            updatedStock.estado = stockData.estado;
            this.items[index] = updatedStock;
            return true;
        }
        return false;
    }

    delete(id: string): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    getById(id: string): Stock | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Stock[] {
        return [...this.items];
    }

    getByAutomovil(automovilId: string): Stock[] {
        return this.items.filter(item => item.automovilId === automovilId);
    }

    getByConcesionario(concesionarioId: string): Stock[] {
        return this.items.filter(item => item.concesionarioId === concesionarioId);
    }

    getByEstado(estado: 'disponible' | 'vendido' | 'reservado'): Stock[] {
        return this.items.filter(item => item.estado === estado);
    }

    getByUbicacion(ubicacion: 'concesionario' | 'servicio_oficial'): Stock[] {
        return this.items.filter(item => item.ubicacion === ubicacion);
    }

    getByNumeroChasis(numeroChasis: string): Stock | undefined {
        return this.items.find(item => item.numeroChasis === numeroChasis);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new Stock(
                '1',
                'WVW1K0AJ5EW123456',
                '1', // Audi A4
                '1', // AutoMax Central
                'concesionario',
                'Negro Metalizado',
                0
            ),
            new Stock(
                '2',
                'WVW1K0AJ5EW789012',
                '2', // Volkswagen Golf
                '1', // AutoMax Central
                'servicio_oficial',
                'Blanco Perla',
                0,
                '1' // Servicio oficial ID
            )
        ];
        this.items = sampleData;
    }
}