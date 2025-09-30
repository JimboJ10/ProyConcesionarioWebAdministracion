import { BaseController } from './BaseController';
import { Vendedor } from '../Entidades/Vendedor';

export class VendedorController extends BaseController<Vendedor> {
    create(vendedor: Vendedor): void {
        vendedor.id = this.generateId();
        this.items.push(vendedor);
    }

    update(id: string, vendedorData: Vendedor): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            // Crear nueva instancia manteniendo los métodos de la clase
            const updatedVendedor = new Vendedor(
                id,
                vendedorData.nombre,
                vendedorData.apellidos,
                vendedorData.nif,
                vendedorData.direccion,
                vendedorData.telefono,
                vendedorData.email,
                vendedorData.concesionarioId,
                vendedorData.salario
            );
            // Mantener la fecha de ingreso original
            updatedVendedor.fechaIngreso = this.items[index].fechaIngreso;
            this.items[index] = updatedVendedor;
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

    getById(id: string): Vendedor | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Vendedor[] {
        return [...this.items];
    }

    getByConcesionario(concesionarioId: string): Vendedor[] {
        return this.items.filter(item => item.concesionarioId === concesionarioId);
    }

    getByNif(nif: string): Vendedor | undefined {
        return this.items.find(item => item.nif === nif);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new Vendedor(
                '1',
                'Juan',
                'Pérez García',
                '12345678A',
                'Calle Sol 123, Madrid',
                '600123456',
                'juan.perez@automax.com',
                '1',
                2500
            ),
            new Vendedor(
                '2',
                'María',
                'López Rodríguez',
                '87654321B',
                'Av. Libertad 456, Barcelona',
                '600987654',
                'maria.lopez@cochespremium.com',
                '2',
                2800
            )
        ];
        this.items = sampleData;
    }
}