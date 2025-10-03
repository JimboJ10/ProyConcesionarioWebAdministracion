import { controllerManager } from '../Controlador/controllerManager';
import { Stock } from '../Entidades/Stock';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class StockOperations {
    
    // CREAR - INSERT
    static async insertar(formData: any): Promise<boolean> {
        try {
            // Validaciones
            if (!Validators.validateVIN(formData.numeroChasis)) {
                NotificationService.error('Error de Validación', 'Número de chasis (VIN) inválido');
                return false;
            }

            if (formData.kilometraje < 0) {
                NotificationService.error('Error de Validación', 'El kilometraje no puede ser negativo');
                return false;
            }

            const existeChasis = controllerManager.stockController.getByNumeroChasis(formData.numeroChasis);
            if (existeChasis) {
                NotificationService.error('Error', 'Ya existe un vehículo con ese número de chasis');
                return false;
            }

            // Verifica que el automóvil existe
            const automovil = controllerManager.automovilController.getById(formData.automovilId);
            if (!automovil) {
                NotificationService.error('Error', 'El modelo de automóvil seleccionado no existe');
                return false;
            }

            // Verifica que el concesionario existe
            const concesionario = controllerManager.concesionarioController.getById(formData.concesionarioId);
            if (!concesionario) {
                NotificationService.error('Error', 'El concesionario seleccionado no existe');
                return false;
            }

            // Si es servicio oficial, verifica que existe
            if (formData.ubicacion === 'servicio_oficial' && formData.servicioOficialId) {
                const servicioOficial = controllerManager.servicioOficialController.getById(formData.servicioOficialId);
                if (!servicioOficial) {
                    NotificationService.error('Error', 'El servicio oficial seleccionado no existe');
                    return false;
                }
            }

            // Crear nuevo stock
            const nuevoStock = new Stock(
                '', // Se genera automáticamente
                formData.numeroChasis,
                formData.automovilId,
                formData.concesionarioId,
                formData.ubicacion,
                formData.color,
                formData.kilometraje || 0,
                formData.servicioOficialId
            );

            controllerManager.stockController.create(nuevoStock);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar stock:', error);
            return false;
        }
    }

    // MODIFICAR - UPDATE
    static async modificar(id: string, formData: any): Promise<boolean> {
        try {
            // Validaciones
            if (!Validators.validateVIN(formData.numeroChasis)) {
                NotificationService.error('Error de Validación', 'Número de chasis (VIN) inválido');
                return false;
            }

            if (formData.kilometraje < 0) {
                NotificationService.error('Error de Validación', 'El kilometraje no puede ser negativo');
                return false;
            }

            // Verificar que el stock existe
            const stockExistente = controllerManager.stockController.getById(id);
            if (!stockExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            const existeChasis = controllerManager.stockController.getByNumeroChasis(formData.numeroChasis);
            if (existeChasis && existeChasis.id !== id) {
                NotificationService.error('Error', 'Ya existe un vehículo con ese número de chasis');
                return false;
            }

            // Crear objeto actualizado
            const stockActualizado = new Stock(
                id,
                formData.numeroChasis,
                formData.automovilId,
                formData.concesionarioId,
                formData.ubicacion,
                formData.color,
                formData.kilometraje || 0,
                formData.servicioOficialId
            );

            // Mantener estado original si no se especifica
            if (formData.estado) {
                stockActualizado.estado = formData.estado;
            }

            const resultado = controllerManager.stockController.update(id, stockActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el stock');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar stock:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el stock existe
            const stock = controllerManager.stockController.getById(id);
            if (!stock) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // No se puede eliminar si está vendido o tiene ventas asociadas
            if (stock.estado === 'vendido') {
                NotificationService.error('Error', 'No se puede eliminar un vehículo que ya está vendido');
                return false;
            }

            // Confirmar eliminación
            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.stockController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el stock');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar stock:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Stock[] {
        return controllerManager.stockController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Stock | undefined {
        return controllerManager.stockController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Stock[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(stock => 
            stock.numeroChasis.toLowerCase().includes(terminoLower) ||
            stock.color.toLowerCase().includes(terminoLower) ||
            stock.estado.toLowerCase().includes(terminoLower)
        );
    }

    // FILTRAR POR ESTADO
    static filtrarPorEstado(estado: 'disponible' | 'vendido' | 'reservado'): Stock[] {
        return controllerManager.stockController.getByEstado(estado);
    }

    // FILTRAR POR AUTOMÓVIL
    static filtrarPorAutomovil(automovilId: string): Stock[] {
        return controllerManager.stockController.getByAutomovil(automovilId);
    }

    // FILTRAR POR CONCESIONARIO
    static filtrarPorConcesionario(concesionarioId: string): Stock[] {
        return controllerManager.stockController.getByConcesionario(concesionarioId);
    }

    // CAMBIAR ESTADO
    static async cambiarEstado(id: string, nuevoEstado: 'disponible' | 'vendido' | 'reservado'): Promise<boolean> {
        try {
            const stock = controllerManager.stockController.getById(id);
            if (!stock) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            stock.estado = nuevoEstado;
            const resultado = controllerManager.stockController.update(id, stock);
            
            if (resultado) {
                NotificationService.success('Éxito', `Estado cambiado a ${nuevoEstado}`);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo cambiar el estado');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al cambiar estado:', error);
            return false;
        }
    }
}