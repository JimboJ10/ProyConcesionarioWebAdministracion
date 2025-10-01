import { controllerManager } from '../Controlador/controllerManager';
import { Equipamiento } from '../Entidades/Equipamiento';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class EquipamientoOperations {
    
    // CREAR - INSERT
    static async insertar(formData: any): Promise<boolean> {
        try {
            // Validaciones básicas
            if (!formData.nombre || formData.nombre.trim() === '') {
                NotificationService.error('Error de Validación', 'El nombre del equipamiento es obligatorio');
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

            // Verificar que no exista otro equipamiento con el mismo nombre
            const equipamientos = controllerManager.equipamientoController.getAll();
            const existeNombre = equipamientos.find(eq => 
                eq.nombre.toLowerCase() === formData.nombre.toLowerCase()
            );
            if (existeNombre) {
                NotificationService.error('Error', 'Ya existe un equipamiento con ese nombre');
                return false;
            }

            // Crear nuevo equipamiento
            const nuevoEquipamiento = new Equipamiento(
                '', // Se genera automáticamente
                formData.nombre.trim(),
                formData.descripcion.trim(),
                formData.categoria.trim()
            );

            controllerManager.equipamientoController.create(nuevoEquipamiento);
            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar equipamiento:', error);
            return false;
        }
    }

    // MODIFICAR - UPDATE
    static async modificar(id: string, formData: any): Promise<boolean> {
        try {
            // Validaciones básicas
            if (!formData.nombre || formData.nombre.trim() === '') {
                NotificationService.error('Error de Validación', 'El nombre del equipamiento es obligatorio');
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

            // Verificar que el equipamiento existe
            const equipamientoExistente = controllerManager.equipamientoController.getById(id);
            if (!equipamientoExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar que no exista otro equipamiento con el mismo nombre (excepto el actual)
            const equipamientos = controllerManager.equipamientoController.getAll();
            const existeNombre = equipamientos.find(eq => 
                eq.nombre.toLowerCase() === formData.nombre.toLowerCase() && eq.id !== id
            );
            if (existeNombre) {
                NotificationService.error('Error', 'Ya existe un equipamiento con ese nombre');
                return false;
            }

            // Crear objeto actualizado
            const equipamientoActualizado = new Equipamiento(
                id,
                formData.nombre.trim(),
                formData.descripcion.trim(),
                formData.categoria.trim()
            );

            const resultado = controllerManager.equipamientoController.update(id, equipamientoActualizado);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar el equipamiento');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar equipamiento:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que el equipamiento existe
            const equipamiento = controllerManager.equipamientoController.getById(id);
            if (!equipamiento) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Verificar dependencias - No se puede eliminar si está siendo usado en automóviles
            const automoviles = controllerManager.automovilController.getAll();
            const enUso = automoviles.some(auto => 
                auto.equipamientoSerie.includes(id)
            );
            
            if (enUso) {
                NotificationService.error('Error', 'No se puede eliminar. El equipamiento está siendo usado en vehículos');
                return false;
            }

            // Verificar si hay extras relacionados
            const extras = controllerManager.extraController.getAll();
            const extrasRelacionados = extras.filter(extra => extra.equipamientoId === id);
            if (extrasRelacionados.length > 0) {
                NotificationService.error('Error', 'No se puede eliminar. El equipamiento tiene extras relacionados');
                return false;
            }

            // Confirmar eliminación
            if (!confirm(CONSTANTS.MESSAGES.CONFIRM.DELETE)) {
                return false;
            }

            const resultado = controllerManager.equipamientoController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.DELETED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo eliminar el equipamiento');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar equipamiento:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Equipamiento[] {
        return controllerManager.equipamientoController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Equipamiento | undefined {
        return controllerManager.equipamientoController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Equipamiento[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(equipamiento => 
            equipamiento.nombre.toLowerCase().includes(terminoLower) ||
            equipamiento.descripcion.toLowerCase().includes(terminoLower) ||
            equipamiento.categoria.toLowerCase().includes(terminoLower)
        );
    }

    // FILTRAR POR CATEGORÍA
    static filtrarPorCategoria(categoria: string): Equipamiento[] {
        return controllerManager.equipamientoController.getByCategoria(categoria);
    }

    // OBTENER CATEGORÍAS DISPONIBLES
    static obtenerCategorias(): string[] {
        return controllerManager.equipamientoController.getCategorias();
    }
}