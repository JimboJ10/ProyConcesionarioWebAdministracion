import { controllerManager } from '../Controlador/controllerManager';
import { Extra } from '../Entidades/Extra';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class ExtraOperations {
    
    // CREAR - INSERT
    static async insertar(formData: any): Promise<boolean> {
        try {
            // Validaciones
            if (!formData.nombre || formData.nombre.trim() === '') {
                NotificationService.error('Error de Validación', 'El nombre del extra es obligatorio');
                return false;
            }

            if (!formData.descripcion || formData.descripcion.trim() === '') {
                NotificationService.error('Error de Validación', 'La descripción es obligatoria');
                return false;
            }

            if (!formData.categoria || formData.categoria.trim() === '') {
                NotificationService.error('Error de Validación', 'La categoría es obligatoria');
                return false;
            }

            if (!Validators.validatePrice(formData.precio)) {
                NotificationService.error('Error de Validación', 'El precio debe ser mayor que 0');
                return false;
            }

            // Verificar que no exista otro extra con el mismo nombre
            const extras = controllerManager.extraController.getAll();
            const existeNombre = extras.find(extra => 
                extra.nombre.toLowerCase() === formData.nombre.toLowerCase()
            );
            if (existeNombre) {
                NotificationService.error('Error', 'Ya existe un extra con ese nombre');
                return false;
            }

            if (formData.equipamientoId) {
                const equipamiento = controllerManager.equipamientoController.getById(formData.equipamientoId);
                if (!equipamiento) {
                    NotificationService.error('Error', 'El equipamiento seleccionado no existe');
                    return false;
                }
            }

            // Crea nuevo extra
            const nuevoExtra = new Extra(
                '', // Se genera automáticamente
                formData.nombre.trim(),
                formData.descripcion.trim(),
                parseFloat(formData.precio),
                formData.categoria.trim(),
                formData.equipamientoId || undefined
            );

            controllerManager.extraController.create(nuevoExtra);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar extra:', error);
            return false;
        }
    }

    // MODIFICAR - UPDATE
    static async modificar(id: string, formData: any): Promise<boolean> {
        try {
            // Validaciones básicas
            if (!formData.nombre || formData.nombre.trim() === '') {
                NotificationService.error('Error de Validación', 'El nombre del extra es obligatorio');
                return false;
            }

            if (!formData.descripcion || formData.descripcion.trim() === '') {
                NotificationService.error('Error de Validación', 'La descripción es obligatoria');
                return false;
            }

            if (!formData.categoria || formData.categoria.trim() === '') {
                NotificationService.error('Error de Validación', 'La categoría es obligatoria');
                return false;
            }

            if (!Validators.validatePrice(formData.precio)) {
                NotificationService.error('Error de Validación', 'El precio debe ser mayor que 0');
                return false;
            }

            // Verificar que el extra existe
            const extraExistente = controllerManager.extraController.getById(id);
            if (!extraExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            const extras = controllerManager.extraController.getAll();
            const existeNombre = extras.find(extra => 
                extra.nombre.toLowerCase() === formData.nombre.toLowerCase() && extra.id !== id
            );
            if (existeNombre) {
                NotificationService.error('Error', 'Ya existe un extra con ese nombre');
                return false;
            }

            if (formData.equipamientoId) {
                const equipamiento = controllerManager.equipamientoController.getById(formData.equipamientoId);
                if (!equipamiento) {
                    NotificationService.error('Error', 'El equipamiento seleccionado no existe');
                    return false;
                }
            }

            // Crea objeto actualizado
            const extraActualizado = new Extra(
                id,
                formData.nombre.trim(),
                formData.descripcion.trim(),
                parseFloat(formData.precio),
                formData.categoria.trim(),
                formData.equipamientoId || undefined
            );

            const resultado = controllerManager.extraController.update(id, extraActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el extra');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar extra:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el extra existe
            const extra = controllerManager.extraController.getById(id);
            if (!extra) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar dependencias - No se puede eliminar si está siendo usado en automóviles o ventas
            const automoviles = controllerManager.automovilController.getAll();
            const enUsoAutomovil = automoviles.some(auto => 
                auto.extrasDisponibles.includes(id)
            );
            
            if (enUsoAutomovil) {
                NotificationService.error('Error', 'No se puede eliminar. El extra está disponible en vehículos');
                return false;
            }

            // Verificar si está en ventas
            const ventas = controllerManager.ventaController.getAll();
            const enUsoVenta = ventas.some(venta => 
                venta.extrasIncluidos.some(extraVenta => extraVenta.extraId === id)
            );
            
            if (enUsoVenta) {
                NotificationService.error('Error', 'No se puede eliminar. El extra ha sido vendido');
                return false;
            }

            // Confirmar eliminación
            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.extraController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el extra');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar extra:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Extra[] {
        return controllerManager.extraController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Extra | undefined {
        return controllerManager.extraController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Extra[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(extra => 
            extra.nombre.toLowerCase().includes(terminoLower) ||
            extra.descripcion.toLowerCase().includes(terminoLower) ||
            extra.categoria.toLowerCase().includes(terminoLower)
        );
    }

    // FILTRAR POR CATEGORÍA
    static filtrarPorCategoria(categoria: string): Extra[] {
        return controllerManager.extraController.getByCategoria(categoria);
    }

    // FILTRAR POR RANGO DE PRECIO
    static filtrarPorPrecio(min: number, max: number): Extra[] {
        return controllerManager.extraController.getByPriceRange(min, max);
    }

    // OBTENER CATEGORÍAS DISPONIBLES
    static obtenerCategorias(): string[] {
        return controllerManager.extraController.getCategorias();
    }
}