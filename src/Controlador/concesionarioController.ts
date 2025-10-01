import { BaseController } from './baseController';
import { Concesionario } from '../Entidades/Concesionario';

export class ConcesionarioController extends BaseController<Concesionario> {
    create(concesionario: Concesionario): void {
        concesionario.id = this.generateId();
        this.items.push(concesionario);
    }

    update(id: string, concesionarioData: Concesionario): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            // Crear nueva instancia manteniendo los métodos de la clase
            const updatedConcesionario = new Concesionario(
                id,
                concesionarioData.nombre,
                concesionarioData.direccion,
                concesionarioData.nif,
                concesionarioData.telefono,
                concesionarioData.email,
                concesionarioData.marcas
            );
            this.items[index] = updatedConcesionario;
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

    getById(id: string): Concesionario | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Concesionario[] {
        return [...this.items];
    }

    getByNif(nif: string): Concesionario | undefined {
        return this.items.find(item => item.nif === nif);
    }

    getMarcasDisponibles(): string[] {
        const marcas = new Set<string>();
        this.items.forEach(concesionario => {
            concesionario.marcas.forEach(marca => marcas.add(marca));
        });
        return Array.from(marcas);
    }

    // Datos de ejemplo para inicializar
    initializeWithSampleData(): void {
        const sampleData = [
            new Concesionario(
                '1',
                'AutoMax Central',
                'Av. Principal 123, Guayaquil',
                'A12345678',
                '912345678',
                'info@automax.com',
                ['Audi', 'Volkswagen']
            ),
            new Concesionario(
                '2',
                'Coches Premium',
                'Calle Mayor 456, Machala',
                'B87654321',
                '934567890',
                'ventas@cochespremium.com',
                ['BMW', 'Mercedes-Benz']
            )
        ];
        this.items = sampleData;
    }
}