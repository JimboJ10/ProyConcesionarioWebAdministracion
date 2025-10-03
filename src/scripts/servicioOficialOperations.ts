import { controllerManager } from '../Controlador/controllerManager';
import { ServicioOficial } from '../Entidades/ServicioOficial';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class ServicioOficialOperations {
    
    // CREAR - INSERT
    static async insertar(formData: any): Promise<boolean> {
        try {
            // Validaciones
            if (!Validators.validateNIF(formData.nif)) {
                NotificationService.error('Error de Validación', 'NIF inválido');
                return false;
            }

            if (!Validators.validateEmail(formData.email)) {
                NotificationService.error('Error de Validación', 'Email inválido');
                return false;
            }

            if (!Validators.validatePhone(formData.telefono)) {
                NotificationService.error('Error de Validación', 'Teléfono inválido');
                return false;
            }

            // Verificar que no exista otro servicio oficial con el mismo NIF
            const existeNif = controllerManager.servicioOficialController.getByNif(formData.nif);
            if (existeNif) {
                NotificationService.error('Error', 'Ya existe un servicio oficial con ese NIF');
                return false;
            }

            // Verificar que el concesionario existe
            const concesionario = controllerManager.concesionarioController.getById(formData.concesionarioId);
            if (!concesionario) {
                NotificationService.error('Error', 'El concesionario seleccionado no existe');
                return false;
            }

            // Crear nuevo servicio oficial
            const nuevoServicioOficial = new ServicioOficial(
                '', // Se genera automáticamente
                formData.nombre,
                formData.direccion,
                formData.nif,
                formData.telefono,
                formData.email,
                formData.concesionarioId
            );

            controllerManager.servicioOficialController.create(nuevoServicioOficial);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar servicio oficial:', error);
            return false;
        }
    }

    // MODIFICAR - UPDATE
    static async modificar(id: string, formData: any): Promise<boolean> {
        try {
            // Validaciones
            if (!Validators.validateNIF(formData.nif)) {
                NotificationService.error('Error de Validación', 'NIF inválido');
                return false;
            }

            if (!Validators.validateEmail(formData.email)) {
                NotificationService.error('Error de Validación', 'Email inválido');
                return false;
            }

            if (!Validators.validatePhone(formData.telefono)) {
                NotificationService.error('Error de Validación', 'Teléfono inválido');
                return false;
            }

            // Verificar que el servicio oficial existe
            const servicioOficialExistente = controllerManager.servicioOficialController.getById(id);
            if (!servicioOficialExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar que no exista otro servicio oficial con el mismo NIF (excepto el actual)
            const existeNif = controllerManager.servicioOficialController.getByNif(formData.nif);
            if (existeNif && existeNif.id !== id) {
                NotificationService.error('Error', 'Ya existe un servicio oficial con ese NIF');
                return false;
            }

            // Crear objeto actualizado
            const servicioOficialActualizado = new ServicioOficial(
                id,
                formData.nombre,
                formData.direccion,
                formData.nif,
                formData.telefono,
                formData.email,
                formData.concesionarioId
            );

            const resultado = controllerManager.servicioOficialController.update(id, servicioOficialActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el servicio oficial');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar servicio oficial:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el servicio oficial existe
            const servicioOficial = controllerManager.servicioOficialController.getById(id);
            if (!servicioOficial) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            const stockAsociado = controllerManager.stockController.getAll().filter(s => s.servicioOficialId === id);
            if (stockAsociado.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El servicio oficial tiene vehículos en stock');
                return false;
            }

            const ventas = controllerManager.ventaController.getByServicioOficial(id);
            if (ventas.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El servicio oficial tiene ventas asociadas');
                return false;
            }

            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.servicioOficialController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el servicio oficial');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar servicio oficial:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): ServicioOficial[] {
        return controllerManager.servicioOficialController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): ServicioOficial | undefined {
        return controllerManager.servicioOficialController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): ServicioOficial[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(servicio => 
            servicio.nombre.toLowerCase().includes(terminoLower) ||
            servicio.nif.toLowerCase().includes(terminoLower) ||
            servicio.direccion.toLowerCase().includes(terminoLower) ||
            servicio.email.toLowerCase().includes(terminoLower)
        );
    }

    // FILTRAR POR CONCESIONARIO
    static filtrarPorConcesionario(concesionarioId: string): ServicioOficial[] {
        return controllerManager.servicioOficialController.getByConcesionario(concesionarioId);
    }
}