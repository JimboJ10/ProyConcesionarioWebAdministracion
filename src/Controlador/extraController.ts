import { BaseController } from './baseController';
import { Extra } from '../Entidades/Extra';

export class ExtraController extends BaseController<Extra> {
    create(extra: Extra): void {
        extra.id = this.generateId();
        this.items.push(extra);
    }

    update(id: string, extraData: Extra): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const updatedExtra = new Extra(
                id,
                extraData.nombre,
                extraData.descripcion,
                extraData.precio,
                extraData.categoria,
                extraData.equipamientoId
            );
            this.items[index] = updatedExtra;
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

    getById(id: string): Extra | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Extra[] {
        return [...this.items];
    }

    getByCategoria(categoria: string): Extra[] {
        return this.items.filter(item => item.categoria.toLowerCase() === categoria.toLowerCase());
    }

    getByPriceRange(min: number, max: number): Extra[] {
        return this.items.filter(item => item.precio >= min && item.precio <= max);
    }

    getCategorias(): string[] {
        const categorias = new Set<string>();
        this.items.forEach(extra => categorias.add(extra.categoria));
        return Array.from(categorias);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new Extra(
                '1',
                'Airbag Acompañante',
                'Sistema de airbag frontal para el acompañante',
                500,
                'Seguridad',
                '1' // Relacionado con Airbag Conductor
            ),
            new Extra(
                '2',
                'Pintura Metalizada',
                'Acabado de pintura metalizada premium',
                800,
                'Estética'
            ),
            new Extra(
                '3',
                'Llantas de Aleación',
                'Llantas de aleación de 18 pulgadas',
                1200,
                'Estética'
            ),
            new Extra(
                '4',
                'Techo Solar',
                'Techo panorámico con apertura eléctrica',
                1500,
                'Confort'
            )
        ];
        this.items = sampleData;
    }
}