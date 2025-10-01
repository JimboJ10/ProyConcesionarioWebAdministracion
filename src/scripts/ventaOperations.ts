import { controllerManager } from '../Controlador/controllerManager';
import { Venta } from '../Entidades/Venta';
import { Validators } from './validators';
import { NotificationService } from './notifications';
import { CONSTANTS } from './constants';

export class VentaOperations {
    
    // CREAR - INSERT
    static async insertar(formData: any): Promise<boolean> {
        try {
            // Validaciones básicas
            if (!formData.stockId) {
                NotificationService.error('Error de Validación', 'Debe seleccionar un vehículo del stock');
                return false;
            }

            if (!Validators.validatePrice(formData.precioFinal)) {
                NotificationService.error('Error de Validación', 'El precio final debe ser mayor que 0');
                return false;
            }

            if (!formData.modoPago || !['contado', 'financiera'].includes(formData.modoPago)) {
                NotificationService.error('Error de Validación', 'Debe seleccionar un modo de pago válido');
                return false;
            }

            if (!formData.fechaEntrega) {
                NotificationService.error('Error de Validación', 'La fecha de entrega es obligatoria');
                return false;
            }

            if (!Validators.validateMatricula(formData.matricula)) {
                NotificationService.error('Error de Validación', 'Matrícula inválida');
                return false;
            }

            if (!formData.origenStock || !['stock', 'fabrica'].includes(formData.origenStock)) {
                NotificationService.error('Error de Validación', 'Debe seleccionar el origen del stock');
                return false;
            }

            if (!formData.clienteNombre || formData.clienteNombre.trim() === '') {
                NotificationService.error('Error de Validación', 'El nombre del cliente es obligatorio');
                return false;
            }

            if (!Validators.validateNIF(formData.clienteNif)) {
                NotificationService.error('Error de Validación', 'NIF del cliente inválido');
                return false;
            }

            if (!Validators.validatePhone(formData.clienteTelefono)) {
                NotificationService.error('Error de Validación', 'Teléfono del cliente inválido');
                return false;
            }

            // Verificar que el stock existe y está disponible
            const stock = controllerManager.stockController.getById(formData.stockId);
            if (!stock) {
                NotificationService.error('Error', 'El vehículo seleccionado no existe');
                return false;
            }

            if (stock.estado !== 'disponible') {
                NotificationService.error('Error', 'El vehículo seleccionado no está disponible');
                return false;
            }

            // Verificar que no exista otra venta con la misma matrícula
            const ventas = controllerManager.ventaController.getAll();
            const existeMatricula = ventas.find(venta => 
                venta.matricula.toLowerCase() === formData.matricula.toLowerCase()
            );
            if (existeMatricula) {
                NotificationService.error('Error', 'Ya existe una venta con esa matrícula');
                return false;
            }

            // Debe tener al menos un vendedor o servicio oficial
            if (!formData.vendedorId && !formData.servicioOficialId) {
                NotificationService.error('Error de Validación', 'Debe especificar un vendedor o servicio oficial');
                return false;
            }

            // No puede tener ambos al mismo tiempo
            if (formData.vendedorId && formData.servicioOficialId) {
                NotificationService.error('Error de Validación', 'No puede especificar vendedor y servicio oficial al mismo tiempo');
                return false;
            }

            // Verificar vendedor si se especifica
            if (formData.vendedorId) {
                const vendedor = controllerManager.vendedorController.getById(formData.vendedorId);
                if (!vendedor) {
                    NotificationService.error('Error', 'El vendedor seleccionado no existe');
                    return false;
                }
            }

            // Verificar servicio oficial si se especifica
            if (formData.servicioOficialId) {
                const servicioOficial = controllerManager.servicioOficialController.getById(formData.servicioOficialId);
                if (!servicioOficial) {
                    NotificationService.error('Error', 'El servicio oficial seleccionado no existe');
                    return false;
                }
            }

            // Validar extras incluidos
            const extrasIncluidos = formData.extrasIncluidos || [];
            for (const extraIncluido of extrasIncluidos) {
                const extra = controllerManager.extraController.getById(extraIncluido.extraId);
                if (!extra) {
                    NotificationService.error('Error', `El extra ${extraIncluido.extraId} no existe`);
                    return false;
                }
                if (!Validators.validatePrice(extraIncluido.precio)) {
                    NotificationService.error('Error de Validación', 'Todos los extras deben tener un precio válido');
                    return false;
                }
            }

            // Crear nueva venta
            const nuevaVenta = new Venta(
                '', // Se genera automáticamente
                formData.stockId,
                parseFloat(formData.precioFinal),
                formData.modoPago,
                new Date(formData.fechaEntrega),
                formData.matricula.toUpperCase(),
                formData.origenStock,
                formData.clienteNombre.trim(),
                formData.clienteNif.toUpperCase(),
                formData.clienteTelefono,
                formData.vendedorId,
                formData.servicioOficialId,
                extrasIncluidos
            );

            controllerManager.ventaController.create(nuevaVenta);

            // Actualizar el estado del stock a vendido
            stock.estado = 'vendido';
            controllerManager.stockController.update(stock.id, stock);

            NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.CREATED);
            return true;

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al insertar venta:', error);
            return false;
        }
    }

    // MODIFICAR - UPDATE
    static async modificar(id: string, formData: any): Promise<boolean> {
        try {
            // Verificar que la venta existe
            const ventaExistente = controllerManager.ventaController.getById(id);
            if (!ventaExistente) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Solo permitir modificar ciertos campos después de la venta
            if (!Validators.validateMatricula(formData.matricula)) {
                NotificationService.error('Error de Validación', 'Matrícula inválida');
                return false;
            }

            if (!formData.fechaEntrega) {
                NotificationService.error('Error de Validación', 'La fecha de entrega es obligatoria');
                return false;
            }

            if (!formData.clienteNombre || formData.clienteNombre.trim() === '') {
                NotificationService.error('Error de Validación', 'El nombre del cliente es obligatorio');
                return false;
            }

            if (!Validators.validatePhone(formData.clienteTelefono)) {
                NotificationService.error('Error de Validación', 'Teléfono del cliente inválido');
                return false;
            }

            // Verificar que no exista otra venta con la misma matrícula (excepto la actual)
            const ventas = controllerManager.ventaController.getAll();
            const existeMatricula = ventas.find(venta => 
                venta.matricula.toLowerCase() === formData.matricula.toLowerCase() && venta.id !== id
            );
            if (existeMatricula) {
                NotificationService.error('Error', 'Ya existe una venta con esa matrícula');
                return false;
            }

            // Crear objeto actualizado manteniendo datos críticos
            const ventaActualizada = new Venta(
                id,
                ventaExistente.stockId, // No se puede cambiar
                ventaExistente.precioFinal, // No se puede cambiar
                ventaExistente.modoPago, // No se puede cambiar
                new Date(formData.fechaEntrega),
                formData.matricula.toUpperCase(),
                ventaExistente.origenStock, // No se puede cambiar
                formData.clienteNombre.trim(),
                ventaExistente.clienteNif, // No se puede cambiar
                formData.clienteTelefono,
                ventaExistente.vendedorId, // No se puede cambiar
                ventaExistente.servicioOficialId, // No se puede cambiar
                ventaExistente.extrasIncluidos // No se puede cambiar
            );

            // Mantener fecha de venta original
            ventaActualizada.fechaVenta = ventaExistente.fechaVenta;

            const resultado = controllerManager.ventaController.update(id, ventaActualizada);
            
            if (resultado) {
                NotificationService.success('Éxito', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo actualizar la venta');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al modificar venta:', error);
            return false;
        }
    }

    // ELIMINAR - DELETE (Cancelar venta)
    static async eliminar(id: string): Promise<boolean> {
        try {
            // Verificar que la venta existe
            const venta = controllerManager.ventaController.getById(id);
            if (!venta) {
                NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return false;
            }

            // Confirmar cancelación
            if (!confirm('¿Estás seguro de que deseas cancelar esta venta? El vehículo volverá a estar disponible.')) {
                return false;
            }

            // Restaurar el estado del stock a disponible
            const stock = controllerManager.stockController.getById(venta.stockId);
            if (stock) {
                stock.estado = 'disponible';
                controllerManager.stockController.update(stock.id, stock);
            }

            const resultado = controllerManager.ventaController.delete(id);
            
            if (resultado) {
                NotificationService.success('Éxito', 'Venta cancelada exitosamente');
                return true;
            } else {
                NotificationService.error('Error', 'No se pudo cancelar la venta');
                return false;
            }

        } catch (error) {
            NotificationService.error('Error', CONSTANTS.MESSAGES.ERROR.GENERAL);
            console.error('Error al eliminar venta:', error);
            return false;
        }
    }

    // LISTAR - READ
    static listar(): Venta[] {
        return controllerManager.ventaController.getAll();
    }

    // OBTENER POR ID
    static obtenerPorId(id: string): Venta | undefined {
        return controllerManager.ventaController.getById(id);
    }

    // BÚSQUEDA
    static buscar(termino: string): Venta[] {
        const todos = this.listar();
        if (!termino.trim()) return todos;

        const terminoLower = termino.toLowerCase();
        return todos.filter(venta => 
            venta.matricula.toLowerCase().includes(terminoLower) ||
            venta.clienteNombre.toLowerCase().includes(terminoLower) ||
            venta.clienteNif.toLowerCase().includes(terminoLower) ||
            venta.clienteTelefono.includes(termino)
        );
    }

    // FILTRAR POR VENDEDOR
    static filtrarPorVendedor(vendedorId: string): Venta[] {
        return controllerManager.ventaController.getByVendedor(vendedorId);
    }

    // FILTRAR POR SERVICIO OFICIAL
    static filtrarPorServicioOficial(servicioOficialId: string): Venta[] {
        return controllerManager.ventaController.getByServicioOficial(servicioOficialId);
    }

    // FILTRAR POR MODO DE PAGO
    static filtrarPorModoPago(modoPago: 'contado' | 'financiera'): Venta[] {
        return controllerManager.ventaController.getByModoPago(modoPago);
    }

    // FILTRAR POR RANGO DE FECHAS
    static filtrarPorFechas(fechaInicio: Date, fechaFin: Date): Venta[] {
        return controllerManager.ventaController.getByFechaRange(fechaInicio, fechaFin);
    }

    // OBTENER TOTAL DE VENTAS
    static obtenerTotalVentas(): number {
        return controllerManager.ventaController.getTotalVentas();
    }

    // OBTENER ESTADÍSTICAS
    static obtenerEstadisticas() {
        const ventas = this.listar();
        return {
            totalVentas: ventas.length,
            importeTotal: this.obtenerTotalVentas(),
            ventasContado: ventas.filter(v => v.modoPago === 'contado').length,
            ventasFinanciera: ventas.filter(v => v.modoPago === 'financiera').length,
            promedioVenta: ventas.length > 0 ? this.obtenerTotalVentas() / ventas.length : 0
        };
    }
}