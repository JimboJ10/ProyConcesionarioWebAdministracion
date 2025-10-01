import { BaseController } from './baseController';
import { Automovil } from '../Entidades/Automovil';

export class AutomovilController extends BaseController<Automovil> {
    create(automovil: Automovil): void {
        automovil.id = this.generateId();
        this.items.push(automovil);
    }

    update(id: string, automovilData: Automovil): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const updatedAutomovil = new Automovil(
                id,
                automovilData.marca,
                automovilData.modelo,
                automovilData.precio,
                automovilData.descuento,
                automovilData.potenciaFiscal,
                automovilData.cilindrada,
                automovilData.combustible,
                automovilData.transmision,
                automovilData.equipamientoSerie,
                automovilData.extrasDisponibles
            );
            this.items[index] = updatedAutomovil;
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

    getById(id: string): Automovil | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): Automovil[] {
        return [...this.items];
    }

    getByMarca(marca: string): Automovil[] {
        return this.items.filter(item => item.marca.toLowerCase() === marca.toLowerCase());
    }

    getByPriceRange(min: number, max: number): Automovil[] {
        return this.items.filter(item => {
            const precio = item.getPrecioConDescuento();
            return precio >= min && precio <= max;
        });
    }

    getMarcas(): string[] {
        const marcas = new Set<string>();
        this.items.forEach(automovil => marcas.add(automovil.marca));
        return Array.from(marcas);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new Automovil(
                '1',
                'Audi',
                'A4',
                35000,
                5,
                150,
                2000,
                'Gasolina',
                'Manual',
                ['1', '2'], // airbag, ABS
                ['3', '4'] // aire acondicionado, navegador
            ),
            new Automovil(
                '2',
                'Volkswagen',
                'Golf',
                25000,
                10,
                110,
                1600,
                'Diésel',
                'Automático',
                ['1'], // airbag
                ['2', '3', '4'] // ABS, aire, navegador
            )
        ];
        this.items = sampleData;
    }
}