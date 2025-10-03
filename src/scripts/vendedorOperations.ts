import { controllerManager } from '../Controlador/controllerManager';
import { Vendedor } from '../Entidades/Vendedor';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class VendedorOperations {
    
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

            if (!Validators.validatePrice(formData.salario)) {
                NotificationService.error('Error de Validación', 'Salario debe ser mayor que 0');
                return false;
            }

            // Verificar que no exista otro vendedor con el mismo NIF
            const existeNif = controllerManager.vendedorController.getByNif(formData.nif);
            if (existeNif) {
                NotificationService.error('Error', 'Ya existe un vendedor con ese NIF');
                return false;
            }

            // Verificar que el concesionario existe
            const concesionario = controllerManager.concesionarioController.getById(formData.concesionarioId);
            if (!concesionario) {
                NotificationService.error('Error', 'El concesionario seleccionado no existe');
                return false;
            }

            const nuevoVendedor = new Vendedor(
                '',
                formData.nombre,
                formData.apellidos,
                formData.nif,
                formData.direccion,
                formData.telefono,
                formData.email,
                formData.concesionarioId,
                formData.salario
            );

            controllerManager.vendedorController.create(nuevoVendedor);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar vendedor:', error);
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

            if (!Validators.validatePrice(formData.salario)) {
                NotificationService.error('Error de Validación', 'Salario debe ser mayor que 0');
                return false;
            }

            // Verificar que el vendedor existe
            const vendedorExistente = controllerManager.vendedorController.getById(id);
            if (!vendedorExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar que no exista otro vendedor con el mismo NIF (excepto el actual)
            const existeNif = controllerManager.vendedorController.getByNif(formData.nif);
            if (existeNif && existeNif.id !== id) {
                NotificationService.error('Error', 'Ya existe un vendedor con ese NIF');
                return false;
            }

            // Crear objeto actualizado
            const vendedorActualizado = new Vendedor(
                id,
                formData.nombre,
                formData.apellidos,
                formData.nif,
                formData.direccion,
                formData.telefono,
                formData.email,
                formData.concesionarioId,
                formData.salario
            );

            const resultado = controllerManager.vendedorController.update(id, vendedorActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el vendedor');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar vendedor:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el vendedor existe
            const vendedor = controllerManager.vendedorController.getById(id);
            if (!vendedor) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            const ventas = controllerManager.ventaController.getByVendedor(id);
            if (ventas.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El vendedor tiene ventas asociadas');
                return false;
            }

            // Confirmar eliminación
            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.vendedorController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el vendedor');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar vendedor:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Vendedor[] {
        return controllerManager.vendedorController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Vendedor | undefined {
        return controllerManager.vendedorController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Vendedor[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(vendedor => 
            vendedor.nombre.toLowerCase().includes(terminoLower) ||
            vendedor.apellidos.toLowerCase().includes(terminoLower) ||
            vendedor.nif.toLowerCase().includes(terminoLower) ||
            vendedor.email.toLowerCase().includes(terminoLower) ||
            vendedor.getNombreCompleto().toLowerCase().includes(terminoLower)
        );
    }

    // FILTRAR POR CONCESIONARIO
    static filtrarPorConcesionario(concesionarioId: string): Vendedor[] {
        return controllerManager.vendedorController.getByConcesionario(concesionarioId);
    }
}