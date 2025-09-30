import { BaseController } from './BaseController';
import { Equipamiento } from '../Entidades/Equipamiento';

export class EquipamientoController extends BaseController<Equipamiento> {
    create(equipamiento: Equipamiento): void {
        equipamiento.id = this.generateId();
        this.items.push(equipamiento);
    }

    update(id: string, equipamientoData: Equipamiento): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const updatedEquipamiento = new Equipamiento(
                id,
                equipamientoData.nombre,
                equipamientoData.descripcion,
                equipamientoData.categoria
            );
            this.items[index] = updatedEquipamiento;
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

    getById(id: string): Equipamiento | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Equipamiento[] {
        return [...this.items];
    }

    getByCategoria(categoria: string): Equipamiento[] {
        return this.items.filter(item => item.categoria.toLowerCase() === categoria.toLowerCase());
    }

    getCategorias(): string[] {
        const categorias = new Set<string>();
        this.items.forEach(equipamiento => categorias.add(equipamiento.categoria));
        return Array.from(categorias);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new Equipamiento(
                '1',
                'Airbag Conductor',
                'Sistema de airbag frontal para el conductor',
                'Seguridad'
            ),
            new Equipamiento(
                '2',
                'ABS',
                'Sistema de frenos antibloqueo',
                'Seguridad'
            ),
            new Equipamiento(
                '3',
                'Aire Acondicionado',
                'Sistema de climatización automática',
                'Confort'
            ),
            new Equipamiento(
                '4',
                'Sistema de Navegación',
                'GPS integrado con pantalla táctil',
                'Tecnología'
            )
        ];
        this.items = sampleData;
    }
}