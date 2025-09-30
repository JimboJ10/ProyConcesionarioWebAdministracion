import { BaseController } from './BaseController';
import { Venta } from '../Entidades/Venta';

export class VentaController extends BaseController<Venta> {
    create(venta: Venta): void {
        venta.id = this.generateId();
        this.items.push(venta);
    }

    update(id: string, ventaData: Venta): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const updatedVenta = new Venta(
                id,
                ventaData.stockId,
                ventaData.precioFinal,
                ventaData.modoPago,
                ventaData.fechaEntrega,
                ventaData.matricula,
                ventaData.origenStock,
                ventaData.clienteNombre,
                ventaData.clienteNif,
                ventaData.clienteTelefono,
                ventaData.vendedorId,
                ventaData.servicioOficialId,
                ventaData.extrasIncluidos
            );
            // Mantener fecha de venta original
            updatedVenta.fechaVenta = this.items[index].fechaVenta;
            this.items[index] = updatedVenta;
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

    getById(id: string): Venta | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Venta[] {
        return [...this.items];
    }

    getByVendedor(vendedorId: string): Venta[] {
        return this.items.filter(item => item.vendedorId === vendedorId);
    }

    getByServicioOficial(servicioOficialId: string): Venta[] {
        return this.items.filter(item => item.servicioOficialId === servicioOficialId);
    }

    getByModoPago(modoPago: 'contado' | 'financiera'): Venta[] {
        return this.items.filter(item => item.modoPago === modoPago);
    }

    getByFechaRange(fechaInicio: Date, fechaFin: Date): Venta[] {
        return this.items.filter(item => 
            item.fechaVenta >= fechaInicio && item.fechaVenta <= fechaFin
        );
    }

    getTotalVentas(): number {
        return this.items.reduce((total, venta) => total + venta.precioFinal, 0);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new Venta(
                '1',
                '1', // Stock ID
                34000,
                'contado',
                new Date('2024-01-15'),
                'ABC-1234',
                'stock',
                'Carlos Mendoza',
                '0987654321',
                '099-123-4567',
                '1', // Vendedor ID
                undefined,
                [{ extraId: '1', precio: 500 }, { extraId: '2', precio: 800 }]
            ),
            new Venta(
                '2',
                '2', // Stock ID
                23500,
                'financiera',
                new Date('2024-01-20'),
                'XYZ-5678',
                'fabrica',
                'Ana Torres',
                '1234567890',
                '098-765-4321',
                undefined,
                '1', // Servicio Oficial ID
                [{ extraId: '3', precio: 1200 }]
            )
        ];
        this.items = sampleData;
    }
}