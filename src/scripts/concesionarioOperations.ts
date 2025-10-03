import { controllerManager } from '../Controlador/controllerManager';
import { Concesionario } from '../Entidades/Concesionario';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class ConcesionarioOperations {
    
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

            // Verificar que no exista otro concesionario con el mismo NIF
            const existeNif = controllerManager.concesionarioController.getByNif(formData.nif);
            if (existeNif) {
                NotificationService.error('Error', 'Ya existe un concesionario con ese NIF');
                return false;
            }

            // Crear nuevo concesionario
            const nuevoConcesionario = new Concesionario(
                '', // Se genera automáticamente
                formData.nombre,
                formData.direccion,
                formData.nif,
                formData.telefono,
                formData.email,
                formData.marcas || []
            );

            controllerManager.concesionarioController.create(nuevoConcesionario);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar concesionario:', error);
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

            // Verificar que el concesionario existe
            const concesionarioExistente = controllerManager.concesionarioController.getById(id);
            if (!concesionarioExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            const existeNif = controllerManager.concesionarioController.getByNif(formData.nif);
            if (existeNif && existeNif.id !== id) {
                NotificationService.error('Error', 'Ya existe un concesionario con ese NIF');
                return false;
            }

            // Crea objeto actualizado
            const concesionarioActualizado = new Concesionario(
                id,
                formData.nombre,
                formData.direccion,
                formData.nif,
                formData.telefono,
                formData.email,
                formData.marcas || []
            );

            const resultado = controllerManager.concesionarioController.update(id, concesionarioActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el concesionario');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar concesionario:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el concesionario existe
            const concesionario = controllerManager.concesionarioController.getById(id);
            if (!concesionario) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar dependencias - No se puede eliminar si tiene vendedores o servicios oficiales
            const vendedores = controllerManager.vendedorController.getByConcesionario(id);
            if (vendedores.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El concesionario tiene vendedores asociados');
                return false;
            }

            const serviciosOficiales = controllerManager.servicioOficialController.getByConcesionario(id);
            if (serviciosOficiales.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El concesionario tiene servicios oficiales asociados');
                return false;
            }

            // Confirmar eliminación
            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.concesionarioController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el concesionario');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar concesionario:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Concesionario[] {
        return controllerManager.concesionarioController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Concesionario | undefined {
        return controllerManager.concesionarioController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Concesionario[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(concesionario => 
            concesionario.nombre.toLowerCase().includes(terminoLower) ||
            concesionario.nif.toLowerCase().includes(terminoLower) ||
            concesionario.direccion.toLowerCase().includes(terminoLower) ||
            concesionario.email.toLowerCase().includes(terminoLower)
        );
    }

    // OBTENER MARCAS DISPONIBLES
    static obtenerMarcasDisponibles(): string[] {
        return controllerManager.concesionarioController.getMarcasDisponibles();
    }
}