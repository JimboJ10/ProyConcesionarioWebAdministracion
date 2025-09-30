import { BaseController } from './BaseController';
import { ServicioOficial } from '../Entidades/ServicioOficial';

export class ServicioOficialController extends BaseController<ServicioOficial> {
    create(servicioOficial: ServicioOficial): void {
        servicioOficial.id = this.generateId();
        this.items.push(servicioOficial);
    }

    update(id: string, servicioOficialData: ServicioOficial): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const updatedServicioOficial = new ServicioOficial(
                id,
                servicioOficialData.nombre,
                servicioOficialData.direccion,
                servicioOficialData.nif,
                servicioOficialData.telefono,
                servicioOficialData.email,
                servicioOficialData.concesionarioId
            );
            this.items[index] = updatedServicioOficial;
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

    getById(id: string): ServicioOficial | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): ServicioOficial[] {
        return [...this.items];
    }

    getByConcesionario(concesionarioId: string): ServicioOficial[] {
        return this.items.filter(item => item.concesionarioId === concesionarioId);
    }

    getByNif(nif: string): ServicioOficial | undefined {
        return this.items.find(item => item.nif === nif);
    }

    // Datos de ejemplo
    initializeWithSampleData(): void {
        const sampleData = [
            new ServicioOficial(
                '1',
                'AutoMax Norte',
                'Av. Norte 789, Quito',
                'C11111111',
                '923456789',
                'norte@automax.com',
                '1' // AutoMax Central
            ),
            new ServicioOficial(
                '2',
                'Premium Sur',
                'Calle Sur 321, Cuenca',
                'D22222222',
                '945678901',
                'sur@cochespremium.com',
                '2' // Coches Premium
            )
        ];
        this.items = sampleData;
    }
}