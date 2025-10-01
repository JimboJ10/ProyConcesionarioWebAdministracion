import { controllerManager } from '../Controlador/controllerManager';
import { Automovil } from '../Entidades/Automovil';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class AutomovilOperations {
    
    // CREAR - INSERT
    static async insertar(formData: any): Promise<boolean> {
        try {
            // Validaciones
            if (!Validators.validatePrice(formData.precio)) {
                NotificationService.error('Error de Validación', 'Precio inválido');
                return false;
            }

            if (!Validators.validateDiscount(formData.descuento)) {
                NotificationService.error('Error de Validación', 'Descuento debe estar entre 0 y 100%');
                return false;
            }

            if (formData.potenciaFiscal < CONSTANTS.VALIDATION.MIN_HORSEPOWER || 
                formData.potenciaFiscal > CONSTANTS.VALIDATION.MAX_HORSEPOWER) {
                NotificationService.error('Error de Validación', 'Potencia fiscal fuera de rango');
                return false;
            }

            if (formData.cilindrada < CONSTANTS.VALIDATION.MIN_DISPLACEMENT || 
                formData.cilindrada > CONSTANTS.VALIDATION.MAX_DISPLACEMENT) {
                NotificationService.error('Error de Validación', 'Cilindrada fuera de rango');
                return false;
            }

            // Crear nuevo automóvil
            const nuevoAutomovil = new Automovil(
                '', // Se genera automáticamente
                formData.marca,
                formData.modelo,
                formData.precio,
                formData.descuento || 0,
                formData.potenciaFiscal,
                formData.cilindrada,
                formData.combustible,
                formData.transmision,
                formData.equipamientoSerie || [],
                formData.extrasDisponibles || []
            );

            controllerManager.automovilController.create(nuevoAutomovil);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar automóvil:', error);
            return false;
        }
    }

    // MODIFICAR - UPDATE
    static async modificar(id: string, formData: any): Promise<boolean> {
        try {
            // Validaciones similares al insertar
            if (!Validators.validatePrice(formData.precio)) {
                NotificationService.error('Error de Validación', 'Precio inválido');
                return false;
            }

            // Verificar que el automóvil existe
            const automovilExistente = controllerManager.automovilController.getById(id);
            if (!automovilExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Crear objeto actualizado
            const automovilActualizado = new Automovil(
                id,
                formData.marca,
                formData.modelo,
                formData.precio,
                formData.descuento || 0,
                formData.potenciaFiscal,
                formData.cilindrada,
                formData.combustible,
                formData.transmision,
                formData.equipamientoSerie || [],
                formData.extrasDisponibles || []
            );

            const resultado = controllerManager.automovilController.update(id, automovilActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el automóvil');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar automóvil:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el automóvil existe
            const automovil = controllerManager.automovilController.getById(id);
            if (!automovil) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar dependencias - No se puede eliminar si tiene stock
            const stock = controllerManager.stockController.getByAutomovil(id);
            if (stock.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El automóvil tiene stock asociado');
                return false;
            }

            // Confirmar eliminación
            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.automovilController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el automóvil');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar automóvil:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Automovil[] {
        return controllerManager.automovilController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Automovil | undefined {
        return controllerManager.automovilController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Automovil[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(automovil => 
            automovil.marca.toLowerCase().includes(terminoLower) ||
            automovil.modelo.toLowerCase().includes(terminoLower) ||
            automovil.combustible.toLowerCase().includes(terminoLower) ||
            automovil.transmision.toLowerCase().includes(terminoLower)
        );
    }

    // FILTRAR POR MARCA
    static filtrarPorMarca(marca: string): Automovil[] {
        return controllerManager.automovilController.getByMarca(marca);
    }

    // FILTRAR POR RANGO DE PRECIO
    static filtrarPorPrecio(min: number, max: number): Automovil[] {
        return controllerManager.automovilController.getByPriceRange(min, max);
    }
}