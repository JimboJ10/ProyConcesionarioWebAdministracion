import { VentaOperations } from '../scripts/ventaOperations';
import { StockOperations } from '../scripts/stockOperations';
import { VendedorOperations } from '../scripts/vendedorOperations';
import { ServicioOficialOperations } from '../scripts/servicioOficialOperations';
import { AutomovilOperations } from '../scripts/automovilOperations';
import { ExtraOperations } from '../scripts/extraOperations';
import { Venta } from '../Entidades/Venta';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class VentaPage {
    private ventas: Venta[] = [];
    private ventasFiltradas: Venta[] = [];
    private paginaActual: number = 1;
    private tamañoPagina: number = CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE;
    private terminoBusqueda: string = '';
    private idEditando: string | null = null;

    renderizar(contenedor: HTMLElement): void {
        this.cargarDatos();
        
        contenedor.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
                    <button id="btn-nueva-venta" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        <span>Nueva Venta</span>
                    </button>
                </div>

                <!-- Búsqueda y Filtros -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div class="md:col-span-2">
                            <input type="text" id="entrada-busqueda" placeholder="Buscar por matrícula, cliente, NIF..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <select id="filtro-modo-pago" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los pagos</option>
                                <option value="contado">Al contado</option>
                                <option value="financiera">Financiera</option>
                            </select>
                        </div>
                        <div>
                            <select id="filtro-vendedor" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los vendedores</option>
                                ${this.obtenerOpcionesVendedores()}
                            </select>
                        </div>
                        <div>
                            <select id="filtro-rango-fechas" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las fechas</option>
                                <option value="hoy">Hoy</option>
                                <option value="semana">Esta semana</option>
                                <option value="mes">Este mes</option>
                                <option value="trimestre">Este trimestre</option>
                                <option value="año">Este año</option>
                            </select>
                        </div>
                        <div class="flex gap-2">
                            <select id="tamaño-pagina" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${CONSTANTS.PAGINATION.PAGE_SIZE_OPTIONS.map(size => 
                                    `<option value="${size}" ${size === this.tamañoPagina ? 'selected' : ''}>${size} por página</option>`
                                ).join('')}
                            </select>
                            <button id="btn-actualizar" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Estadísticas rápidas -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    ${this.crearTarjetasEstadisticas()}
                </div>

                <!-- Tabla -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venta</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendido Por</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Final</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="cuerpo-tabla" class="bg-white divide-y divide-gray-200">
                                <!-- Los datos se cargarán aquí -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Paginación -->
                    <div id="paginacion" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <!-- La paginación se cargará aquí -->
                    </div>
                </div>

                <!-- Modal Form Nueva Venta -->
                <div id="modal-venta" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 id="titulo-modal-venta" class="text-lg font-medium text-gray-900">Nueva Venta</h3>
                        </div>
                        <form id="formulario-venta" class="px-6 py-4">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Selección de Vehículo -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Selección de Vehículo</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo del Stock *</label>
                                        <select id="stock-id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar vehículo</option>
                                            ${this.obtenerOpcionesStockDisponible()}
                                        </select>
                                        <p class="text-xs text-gray-500 mt-1">Solo vehículos disponibles</p>
                                    </div>

                                    <!-- Información del vehículo seleccionado -->
                                    <div id="info-vehiculo" class="hidden">
                                        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                                            <h5 class="text-sm font-medium text-blue-800 mb-2">Información del Vehículo</h5>
                                            <div id="detalles-vehiculo" class="text-xs text-blue-600">
                                                <!-- Se cargará dinámicamente -->
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                                        <input type="text" id="matricula" required 
                                               placeholder="1234ABC"
                                               pattern="[0-9]{4}[A-Z]{3}"
                                               maxlength="7"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <p class="text-xs text-gray-500 mt-1">Formato: 1234ABC</p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Origen del Stock *</label>
                                        <select id="origen-stock" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar origen</option>
                                            <option value="stock">Stock existente</option>
                                            <option value="fabrica">Pedido a fábrica</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Información del Cliente -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Información del Cliente</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                        <input type="text" id="cliente-nombre" required 
                                               placeholder="Juan Pérez García"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">NIF/CIF *</label>
                                        <input type="text" id="cliente-nif" required 
                                               placeholder="12345678A"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                        <input type="tel" id="cliente-telefono" required 
                                               placeholder="912345678"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega *</label>
                                        <input type="date" id="fecha-entrega" required 
                                               min="${new Date().toISOString().split('T')[0]}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>

                                <!-- Vendedor o Servicio Oficial -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Vendedor / Servicio Oficial</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Venta *</label>
                                        <select id="tipo-venta" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar tipo</option>
                                            <option value="vendedor">Por Vendedor</option>
                                            <option value="servicio">Por Servicio Oficial</option>
                                        </select>
                                    </div>

                                    <div id="seleccion-vendedor" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                                        <select id="vendedor-id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar vendedor</option>
                                            ${this.obtenerOpcionesVendedores()}
                                        </select>
                                    </div>

                                    <div id="seleccion-servicio" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Servicio Oficial</label>
                                        <select id="servicio-oficial-id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar servicio oficial</option>
                                            ${this.obtenerOpcionesServiciosOficiales()}
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Modo de Pago *</label>
                                        <select id="modo-pago" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar modo</option>
                                            <option value="contado">Al contado</option>
                                            <option value="financiera">Financiera</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Extras y Precio -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Extras y Precio Final</h4>
                                    
                                    <div id="extras-disponibles" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Extras Incluidos</label>
                                        <div id="lista-extras" class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                            <!-- Se cargará dinámicamente -->
                                        </div>
                                    </div>

                                    <!-- Resumen de Precios -->
                                    <div class="bg-green-50 border border-green-200 rounded-md p-4">
                                        <h5 class="text-sm font-medium text-green-800 mb-3">💰 Resumen de Precios</h5>
                                        <div class="space-y-2 text-sm text-green-700">
                                            <div class="flex justify-between">
                                                <span>Precio base del vehículo:</span>
                                                <span id="precio-base">$0.00</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span>Descuento aplicado:</span>
                                                <span id="descuento-aplicado">$0.00</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span>Extras incluidos:</span>
                                                <span id="precio-extras">$0.00</span>
                                            </div>
                                            <div class="border-t border-green-300 pt-2">
                                                <div class="flex justify-between font-medium">
                                                    <span>Precio final:</span>
                                                    <span id="precio-final-calculado">$0.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Precio Final de Venta *</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span class="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input type="number" id="precio-final" required min="0" step="0.01"
                                                   placeholder="0.00"
                                                   class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </div>
                                        <p class="text-xs text-gray-500 mt-1">Precio final negociado con el cliente</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                            <button id="btn-cancelar-venta" class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">
                                Cancelar
                            </button>
                            <button id="btn-guardar-venta" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                                Registrar Venta
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Modal de Detalles de Venta -->
                <div id="modal-detalles-venta" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-medium text-gray-900">Detalles de la Venta</h3>
                        </div>
                        <div id="contenido-detalles-venta" class="px-6 py-4">
                            <!-- Se cargará dinámicamente -->
                        </div>
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button id="btn-cerrar-detalles-venta" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.configurarEventListeners();
        this.renderizarTabla();
    }

    private cargarDatos(): void {
        this.ventas = VentaOperations.listar();
        this.aplicarFiltros();
    }

    private aplicarFiltros(): void {
        let ventasFiltradas = VentaOperations.buscar(this.terminoBusqueda);
        
        // Aplicar filtro de modo de pago
        const modoPagoSeleccionado = (document.getElementById('filtro-modo-pago') as HTMLSelectElement)?.value;
        if (modoPagoSeleccionado) {
            ventasFiltradas = ventasFiltradas.filter(venta => venta.modoPago === modoPagoSeleccionado);
        }

        // Aplicar filtro de vendedor
        const vendedorSeleccionado = (document.getElementById('filtro-vendedor') as HTMLSelectElement)?.value;
        if (vendedorSeleccionado) {
            ventasFiltradas = ventasFiltradas.filter(venta => venta.vendedorId === vendedorSeleccionado);
        }

        // Aplicar filtro de rango de fechas
        const rangoFechasSeleccionado = (document.getElementById('filtro-rango-fechas') as HTMLSelectElement)?.value;
        if (rangoFechasSeleccionado) {
            ventasFiltradas = this.filtrarPorRangoFechas(ventasFiltradas, rangoFechasSeleccionado);
        }
        
        this.ventasFiltradas = ventasFiltradas;
        this.paginaActual = 1;
        this.renderizarTabla();
    }

    private filtrarPorRangoFechas(ventas: Venta[], rango: string): Venta[] {
        const hoy = new Date();
        let fechaInicio: Date;

        switch (rango) {
            case 'hoy':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                return ventas.filter(venta => venta.fechaVenta >= fechaInicio);
            
            case 'semana':
                fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                return ventas.filter(venta => venta.fechaVenta >= fechaInicio);
            
            case 'mes':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                return ventas.filter(venta => venta.fechaVenta >= fechaInicio);
            
            case 'trimestre':
                const trimestre = Math.floor(hoy.getMonth() / 3);
                fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1);
                return ventas.filter(venta => venta.fechaVenta >= fechaInicio);
            
            case 'año':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                return ventas.filter(venta => venta.fechaVenta >= fechaInicio);
            
            default:
                return ventas;
        }
    }

    private obtenerOpcionesVendedores(): string {
        const vendedores = VendedorOperations.listar();
        return vendedores.map(vendedor => 
            `<option value="${vendedor.id}">${vendedor.getNombreCompleto()}</option>`
        ).join('');
    }

    private obtenerOpcionesServiciosOficiales(): string {
        const servicios = ServicioOficialOperations.listar();
        return servicios.map(servicio => 
            `<option value="${servicio.id}">${servicio.nombre}</option>`
        ).join('');
    }

    private obtenerOpcionesStockDisponible(): string {
        const stockDisponible = StockOperations.filtrarPorEstado('disponible');
        return stockDisponible.map(stock => {
            const automovil = AutomovilOperations.obtenerPorId(stock.automovilId);
            const marca = automovil ? `${automovil.marca} ${automovil.modelo}` : 'Vehículo no encontrado';
            return `<option value="${stock.id}">${marca} - ${stock.color} (${stock.numeroChasis})</option>`;
        }).join('');
    }

    private crearTarjetasEstadisticas(): string {
        const estadisticas = VentaOperations.obtenerEstadisticas();
        
        const tarjetas = [
            {
                titulo: 'Total Ventas',
                valor: estadisticas.totalVentas.toString(),
                icono: '📊',
                color: 'bg-blue-500'
            },
            {
                titulo: 'Importe Total',
                valor: Formatters.formatPrice(estadisticas.importeTotal),
                icono: '💰',
                color: 'bg-green-500'
            },
            {
                titulo: 'Ventas al Contado',
                valor: estadisticas.ventasContado.toString(),
                icono: '💵',
                color: 'bg-purple-500'
            },
            {
                titulo: 'Promedio por Venta',
                valor: Formatters.formatPrice(estadisticas.promedioVenta),
                icono: '📈',
                color: 'bg-orange-500'
            }
        ];

        return tarjetas.map(tarjeta => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <div class="flex items-center">
                    <div class="${tarjeta.color} rounded-full p-3 text-white text-xl mr-3">
                        ${tarjeta.icono}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">${tarjeta.titulo}</p>
                        <p class="text-lg font-bold text-gray-900">${tarjeta.valor}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    private renderizarTabla(): void {
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        if (!cuerpoTabla) return;

        const indiceInicio = (this.paginaActual - 1) * this.tamañoPagina;
        const indiceFin = indiceInicio + this.tamañoPagina;
        const datosPaginados = this.ventasFiltradas.slice(indiceInicio, indiceFin);

        if (datosPaginados.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        ${this.terminoBusqueda ? 'No se encontraron resultados' : 'No hay ventas registradas'}
                    </td>
                </tr>
            `;
        } else {
            cuerpoTabla.innerHTML = datosPaginados.map(venta => {
                const vendedor = venta.vendedorId ? VendedorOperations.obtenerPorId(venta.vendedorId) : null;
                const servicioOficial = venta.servicioOficialId ? ServicioOficialOperations.obtenerPorId(venta.servicioOficialId) : null;
                const stock = StockOperations.obtenerPorId(venta.stockId);
                const automovil = stock ? AutomovilOperations.obtenerPorId(stock.automovilId) : null;
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div class="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                                        💰
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${venta.matricula}</div>
                                    <div class="text-sm text-gray-500">${Formatters.formatDate(venta.fechaVenta)}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${venta.clienteNombre}</div>
                            <div class="text-sm text-gray-500">${venta.clienteNif}</div>
                            <div class="text-sm text-gray-500">${Formatters.formatPhone(venta.clienteTelefono)}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">
                                ${automovil ? `${automovil.marca} ${automovil.modelo}` : 'N/A'}
                            </div>
                            <div class="text-sm text-gray-500">${stock ? stock.color : 'N/A'}</div>
                            <div class="text-xs text-gray-400">${stock ? stock.numeroChasis : 'N/A'}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">
                                ${vendedor ? vendedor.getNombreCompleto() : (servicioOficial ? servicioOficial.nombre : 'N/A')}
                            </div>
                            <div class="text-xs text-gray-500">
                                ${vendedor ? 'Vendedor' : (servicioOficial ? 'Servicio Oficial' : 'N/A')}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${Formatters.formatPrice(venta.precioFinal)}</div>
                            <div class="text-xs text-gray-500">
                                ${venta.modoPago === 'contado' ? '💵 Al contado' : '🏦 Financiera'}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Vendido
                            </span>
                            <div class="text-xs text-gray-500 mt-1">
                                Entrega: ${Formatters.formatDate(venta.fechaEntrega)}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button onclick="ventaPage.verDetallesVenta('${venta.id}')" 
                                        class="text-purple-600 hover:text-purple-900" title="Ver detalles">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                <button onclick="ventaPage.editarVenta('${venta.id}')" 
                                        class="text-blue-600 hover:text-blue-900" title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="ventaPage.cancelarVenta('${venta.id}')" 
                                        class="text-red-600 hover:text-red-900" title="Cancelar venta">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        this.renderizarPaginacion();
    }

    private renderizarPaginacion(): void {
        const paginacion = document.getElementById('paginacion');
        if (!paginacion) return;

        const totalPaginas = Utils.getTotalPages(this.ventasFiltradas.length, this.tamañoPagina);
        const elementoInicio = (this.paginaActual - 1) * this.tamañoPagina + 1;
        const elementoFin = Math.min(this.paginaActual * this.tamañoPagina, this.ventasFiltradas.length);

        paginacion.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                        onclick="ventaPage.cambiarPagina(${this.paginaActual - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                        onclick="ventaPage.cambiarPagina(${this.paginaActual + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${elementoInicio}</span> a <span class="font-medium">${elementoFin}</span> de
                        <span class="font-medium">${this.ventasFiltradas.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                                onclick="ventaPage.cambiarPagina(${this.paginaActual - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generarNumerosPagina(totalPaginas)}
                        <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                                onclick="ventaPage.cambiarPagina(${this.paginaActual + 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        `;
    }

    private generarNumerosPagina(totalPaginas: number): string {
        const paginas = [];
        const maxVisibles = 5;
        let inicio = Math.max(1, this.paginaActual - Math.floor(maxVisibles / 2));
        let fin = Math.min(totalPaginas, inicio + maxVisibles - 1);
        
        if (fin - inicio + 1 < maxVisibles) {
            inicio = Math.max(1, fin - maxVisibles + 1);
        }

        for (let i = inicio; i <= fin; i++) {
            paginas.push(`
                <button onclick="ventaPage.cambiarPagina(${i})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                            i === this.paginaActual ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : ''
                        }">
                    ${i}
                </button>
            `);
        }
        return paginas.join('');
    }

    private configurarEventListeners(): void {
        // Hacer la instancia disponible globalmente
        (window as any).ventaPage = this;

        // Búsqueda
        const entradaBusqueda = document.getElementById('entrada-busqueda') as HTMLInputElement;
        if (entradaBusqueda) {
            const busquedaConRetraso = Utils.debounce((termino: string) => {
                this.terminoBusqueda = termino;
                this.aplicarFiltros();
            }, 300);

            entradaBusqueda.addEventListener('input', (e) => {
                busquedaConRetraso((e.target as HTMLInputElement).value);
            });
        }

        // Filtros
        const filtroModoPago = document.getElementById('filtro-modo-pago') as HTMLSelectElement;
        const filtroVendedor = document.getElementById('filtro-vendedor') as HTMLSelectElement;
        const filtroRangoFechas = document.getElementById('filtro-rango-fechas') as HTMLSelectElement;
        
        if (filtroModoPago) {
            filtroModoPago.addEventListener('change', () => this.aplicarFiltros());
        }
        
        if (filtroVendedor) {
            filtroVendedor.addEventListener('change', () => this.aplicarFiltros());
        }
        
        if (filtroRangoFechas) {
            filtroRangoFechas.addEventListener('change', () => this.aplicarFiltros());
        }

        // Tamaño de página
        const selectTamañoPagina = document.getElementById('tamaño-pagina') as HTMLSelectElement;
        if (selectTamañoPagina) {
            selectTamañoPagina.addEventListener('change', (e) => {
                this.tamañoPagina = parseInt((e.target as HTMLSelectElement).value);
                this.paginaActual = 1;
                this.renderizarTabla();
            });
        }

        // Cambios en el formulario de nueva venta
        const stockSelect = document.getElementById('stock-id') as HTMLSelectElement;
        const tipoVentaSelect = document.getElementById('tipo-venta') as HTMLSelectElement;
        const precioInput = document.getElementById('precio-final') as HTMLInputElement;

        if (stockSelect) {
            stockSelect.addEventListener('change', (e) => {
                this.mostrarInfoVehiculo((e.target as HTMLSelectElement).value);
                this.calcularPrecioTotal();
            });
        }

        if (tipoVentaSelect) {
            tipoVentaSelect.addEventListener('change', (e) => {
                this.mostrarSeleccionVendedorOServicio((e.target as HTMLSelectElement).value);
            });
        }

        if (precioInput) {
            precioInput.addEventListener('input', () => {
                this.actualizarResumenPrecios();
            });
        }

        // Botones principales
        document.getElementById('btn-nueva-venta')?.addEventListener('click', () => this.mostrarModalVenta());
        document.getElementById('btn-actualizar')?.addEventListener('click', () => this.actualizarDatos());
        document.getElementById('btn-cancelar-venta')?.addEventListener('click', () => this.ocultarModalVenta());
        document.getElementById('btn-guardar-venta')?.addEventListener('click', () => this.guardarVenta());
        document.getElementById('btn-cerrar-detalles-venta')?.addEventListener('click', () => this.ocultarModalDetallesVenta());

        // Modales
        document.getElementById('modal-venta')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModalVenta();
        });
        
        document.getElementById('modal-detalles-venta')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModalDetallesVenta();
        });
    }

    private mostrarInfoVehiculo(stockId: string): void {
        const infoContainer = document.getElementById('info-vehiculo');
        const detallesContainer = document.getElementById('detalles-vehiculo');
        const extrasContainer = document.getElementById('extras-disponibles');
        
        if (!stockId) {
            infoContainer?.classList.add('hidden');
            extrasContainer?.classList.add('hidden');
            return;
        }

        const stock = StockOperations.obtenerPorId(stockId);
        const automovil = stock ? AutomovilOperations.obtenerPorId(stock.automovilId) : null;
        
        if (stock && automovil && detallesContainer) {
            detallesContainer.innerHTML = `
                <div><strong>Vehículo:</strong> ${automovil.marca} ${automovil.modelo}</div>
                <div><strong>Color:</strong> ${stock.color}</div>
                <div><strong>Combustible:</strong> ${automovil.combustible}</div>
                <div><strong>Transmisión:</strong> ${automovil.transmision}</div>
                <div><strong>Precio base:</strong> ${Formatters.formatPrice(automovil.getPrecioConDescuento())}</div>
            `;
            infoContainer?.classList.remove('hidden');

            // Mostrar extras disponibles
            this.mostrarExtrasDisponibles(automovil);
            this.calcularPrecioTotal();
        }
    }

    private mostrarExtrasDisponibles(automovil: any): void {
        const extrasContainer = document.getElementById('extras-disponibles');
        const listaExtras = document.getElementById('lista-extras');
        
        if (!extrasContainer || !listaExtras) return;

        if (automovil.extrasDisponibles.length > 0) {
            const extrasHTML = automovil.extrasDisponibles.map((extraId: string) => {
                const extra = ExtraOperations.obtenerPorId(extraId);
                if (!extra) return '';

                return `
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" class="extra-checkbox" data-extra-id="${extra.id}" data-precio="${extra.precio}">
                        <span class="text-sm">${extra.nombre} - ${Formatters.formatPrice(extra.precio)}</span>
                    </label>
                `;
            }).join('');

            listaExtras.innerHTML = extrasHTML;

            // Configurar event listeners para los checkboxes
            const checkboxes = listaExtras.querySelectorAll('.extra-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => this.calcularPrecioTotal());
            });

            extrasContainer.classList.remove('hidden');
        } else {
            extrasContainer.classList.add('hidden');
        }
    }

    private mostrarSeleccionVendedorOServicio(tipo: string): void {
        const seleccionVendedor = document.getElementById('seleccion-vendedor');
        const seleccionServicio = document.getElementById('seleccion-servicio');
        
        if (tipo === 'vendedor') {
            seleccionVendedor?.classList.remove('hidden');
            seleccionServicio?.classList.add('hidden');
            // Limpiar servicio oficial
            (document.getElementById('servicio-oficial-id') as HTMLSelectElement).value = '';
        } else if (tipo === 'servicio') {
            seleccionVendedor?.classList.add('hidden');
            seleccionServicio?.classList.remove('hidden');
            // Limpiar vendedor
            (document.getElementById('vendedor-id') as HTMLSelectElement).value = '';
        } else {
            seleccionVendedor?.classList.add('hidden');
            seleccionServicio?.classList.add('hidden');
        }
    }

    private calcularPrecioTotal(): void {
        const stockId = (document.getElementById('stock-id') as HTMLSelectElement).value;
        if (!stockId) return;

        const stock = StockOperations.obtenerPorId(stockId);
        const automovil = stock ? AutomovilOperations.obtenerPorId(stock.automovilId) : null;
        
        if (!automovil) return;

        const precioBase = automovil.getPrecioConDescuento();
        const descuento = automovil.precio * (automovil.descuento / 100);
        
        // Calcular precio de extras seleccionados
        const extrasSeleccionados = document.querySelectorAll('.extra-checkbox:checked');
        let precioExtras = 0;
        
        extrasSeleccionados.forEach(checkbox => {
            const precio = parseFloat((checkbox as HTMLInputElement).dataset.precio || '0');
            precioExtras += precio;
        });

        const precioTotal = precioBase + precioExtras;

        // Actualizar campos del resumen
        const precioBaseElement = document.getElementById('precio-base');
        const descuentoElement = document.getElementById('descuento-aplicado');
        const precioExtrasElement = document.getElementById('precio-extras');
        const precioFinalCalculadoElement = document.getElementById('precio-final-calculado');
        const precioFinalInput = document.getElementById('precio-final') as HTMLInputElement;

        if (precioBaseElement) precioBaseElement.textContent = Formatters.formatPrice(automovil.precio);
        if (descuentoElement) descuentoElement.textContent = `-${Formatters.formatPrice(descuento)}`;
        if (precioExtrasElement) precioExtrasElement.textContent = Formatters.formatPrice(precioExtras);
        if (precioFinalCalculadoElement) precioFinalCalculadoElement.textContent = Formatters.formatPrice(precioTotal);
        if (precioFinalInput) precioFinalInput.value = precioTotal.toString();
    }

    private actualizarResumenPrecios(): void {
        // Este método se puede usar para recalcular cuando el usuario modifica manualmente el precio final
        this.calcularPrecioTotal();
    }

    // Métodos públicos para ser llamados desde el HTML
    public cambiarPagina(pagina: number): void {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    public editarVenta(id: string): void {
        const venta = VentaOperations.obtenerPorId(id);
        if (venta) {
            this.idEditando = id;
            this.mostrarModalVenta(venta);
        }
    }

    public verDetallesVenta(id: string): void {
        const venta = VentaOperations.obtenerPorId(id);
        if (venta) {
            this.mostrarModalDetallesVenta(venta);
        }
    }

    public async cancelarVenta(id: string): Promise<void> {
        const exito = await VentaOperations.eliminar(id);
        if (exito) {
            this.actualizarDatos();
        }
    }

    private mostrarModalVenta(venta?: Venta): void {
        const modal = document.getElementById('modal-venta');
        const titulo = document.getElementById('titulo-modal-venta');
        
        if (venta) {
            titulo!.textContent = 'Editar Venta';
            this.llenarFormularioVenta(venta);
        } else {
            titulo!.textContent = 'Nueva Venta';
            this.limpiarFormularioVenta();
        }
        
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    }

    private ocultarModalVenta(): void {
        const modal = document.getElementById('modal-venta');
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
        this.idEditando = null;
        this.limpiarFormularioVenta();
    }

    private mostrarModalDetallesVenta(venta: Venta): void {
        const modal = document.getElementById('modal-detalles-venta');
        const contenido = document.getElementById('contenido-detalles-venta');
        
        if (contenido) {
            const vendedor = venta.vendedorId ? VendedorOperations.obtenerPorId(venta.vendedorId) : null;
            const servicioOficial = venta.servicioOficialId ? ServicioOficialOperations.obtenerPorId(venta.servicioOficialId) : null;
            const stock = StockOperations.obtenerPorId(venta.stockId);
            const automovil = stock ? AutomovilOperations.obtenerPorId(stock.automovilId) : null;
            
            contenido.innerHTML = `
                <div class="space-y-6">
                    <!-- Información General -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Información General</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Matrícula</label>
                                <p class="text-sm text-gray-900">${venta.matricula}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Fecha de Venta</label>
                                <p class="text-sm text-gray-900">${Formatters.formatDate(venta.fechaVenta)}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Fecha de Entrega</label>
                                <p class="text-sm text-gray-900">${Formatters.formatDate(venta.fechaEntrega)}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Modo de Pago</label>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    venta.modoPago === 'contado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }">
                                    ${venta.modoPago === 'contado' ? '💵 Al Contado' : '🏦 Financiera'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Información del Cliente -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Información del Cliente</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Nombre Completo</label>
                                <p class="text-sm text-gray-900">${venta.clienteNombre}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">NIF/CIF</label>
                                <p class="text-sm text-gray-900">${venta.clienteNif}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Teléfono</label>
                                <p class="text-sm text-gray-900">${Formatters.formatPhone(venta.clienteTelefono)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Información del Vehículo -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Vehículo Vendido</h4>
                        ${automovil && stock ? `
                            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Marca y Modelo</label>
                                        <p class="text-sm text-blue-900">${automovil.marca} ${automovil.modelo}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Color</label>
                                        <p class="text-sm text-blue-900">${stock.color}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Combustible</label>
                                        <p class="text-sm text-blue-900">${automovil.combustible}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Transmisión</label>
                                        <p class="text-sm text-blue-900">${automovil.transmision}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Número de Chasis</label>
                                        <p class="text-sm text-blue-900">${stock.numeroChasis}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Kilometraje</label>
                                        <p class="text-sm text-blue-900">${stock.kilometraje.toLocaleString()} km</p>
                                    </div>
                                </div>
                            </div>
                        ` : '<p class="text-gray-500">Información del vehículo no disponible</p>'}
                    </div>

                    <!-- Vendedor o Servicio Oficial -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Vendido Por</h4>
                        ${vendedor ? `
                            <div class="bg-green-50 border border-green-200 rounded-md p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-green-600">Vendedor</label>
                                        <p class="text-sm text-green-900">${vendedor.getNombreCompleto()}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-green-600">Email</label>
                                        <p class="text-sm text-green-900">${vendedor.email}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-green-600">Teléfono</label>
                                        <p class="text-sm text-green-900">${Formatters.formatPhone(vendedor.telefono)}</p>
                                    </div>
                                </div>
                            </div>
                        ` : (servicioOficial ? `
                            <div class="bg-purple-50 border border-purple-200 rounded-md p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-purple-600">Servicio Oficial</label>
                                        <p class="text-sm text-purple-900">${servicioOficial.nombre}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-purple-600">Email</label>
                                        <p class="text-sm text-purple-900">${servicioOficial.email}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-purple-600">Teléfono</label>
                                        <p class="text-sm text-purple-900">${Formatters.formatPhone(servicioOficial.telefono)}</p>
                                    </div>
                                </div>
                            </div>
                        ` : '<p class="text-gray-500">Información del vendedor no disponible</p>')}
                    </div>

                    <!-- Extras Incluidos -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Extras Incluidos</h4>
                        ${venta.extrasIncluidos.length > 0 ? `
                            <div class="space-y-2">
                                ${venta.extrasIncluidos.map(extraVenta => {
                                    const extra = ExtraOperations.obtenerPorId(extraVenta.extraId);
                                    return `
                                        <div class="bg-orange-50 border border-orange-200 rounded-md p-3">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-sm font-medium text-orange-900">${extra ? extra.nombre : 'Extra no encontrado'}</div>
                                                    <div class="text-xs text-orange-600">${extra ? extra.descripcion : ''}</div>
                                                </div>
                                                <div class="text-sm font-medium text-orange-800">
                                                    ${Formatters.formatPrice(extraVenta.precio)}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<p class="text-gray-500">No se incluyeron extras en esta venta</p>'}
                    </div>

                    <!-- Resumen Financiero -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Resumen Financiero</h4>
                        <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <div class="space-y-2">
                                ${automovil ? `
                                    <div class="flex justify-between text-sm">
                                        <span>Precio base del vehículo:</span>
                                        <span>${Formatters.formatPrice(automovil.precio)}</span>
                                    </div>
                                    ${automovil.descuento > 0 ? `
                                        <div class="flex justify-between text-sm text-green-600">
                                            <span>Descuento aplicado (${automovil.descuento}%):</span>
                                            <span>-${Formatters.formatPrice(automovil.precio * (automovil.descuento / 100))}</span>
                                        </div>
                                    ` : ''}
                                ` : ''}
                                <div class="flex justify-between text-sm">
                                    <span>Extras incluidos:</span>
                                    <span>${Formatters.formatPrice(venta.getPrecioExtras())}</span>
                                </div>
                                <div class="border-t border-gray-300 pt-2">
                                    <div class="flex justify-between text-lg font-medium">
                                        <span>Precio final:</span>
                                        <span class="text-green-600">${Formatters.formatPrice(venta.precioFinal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    }

    private ocultarModalDetallesVenta(): void {
        const modal = document.getElementById('modal-detalles-venta');
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    }

    private llenarFormularioVenta(venta: Venta): void {
        // Nota: En edición solo permitimos modificar algunos campos
        (document.getElementById('matricula') as HTMLInputElement).value = venta.matricula;
        (document.getElementById('fecha-entrega') as HTMLInputElement).value = venta.fechaEntrega.toISOString().split('T')[0];
        (document.getElementById('cliente-nombre') as HTMLInputElement).value = venta.clienteNombre;
        (document.getElementById('cliente-nif') as HTMLInputElement).value = venta.clienteNif;
        (document.getElementById('cliente-telefono') as HTMLInputElement).value = venta.clienteTelefono;

        // Deshabilitar campos que no se pueden editar después de la venta
        (document.getElementById('stock-id') as HTMLSelectElement).disabled = true;
        (document.getElementById('origen-stock') as HTMLSelectElement).disabled = true;
        (document.getElementById('tipo-venta') as HTMLSelectElement).disabled = true;
        (document.getElementById('vendedor-id') as HTMLSelectElement).disabled = true;
        (document.getElementById('servicio-oficial-id') as HTMLSelectElement).disabled = true;
        (document.getElementById('modo-pago') as HTMLSelectElement).disabled = true;
        (document.getElementById('precio-final') as HTMLInputElement).disabled = true;
    }

    private limpiarFormularioVenta(): void {
        const formulario = document.getElementById('formulario-venta') as HTMLFormElement;
        formulario.reset();
        
        // Rehabilitar todos los campos
        const inputs = formulario.querySelectorAll('input, select');
        inputs.forEach(input => {
            (input as HTMLInputElement | HTMLSelectElement).disabled = false;
        });
        
        // Ocultar secciones condicionales
        document.getElementById('info-vehiculo')?.classList.add('hidden');
        document.getElementById('extras-disponibles')?.classList.add('hidden');
        document.getElementById('seleccion-vendedor')?.classList.add('hidden');
        document.getElementById('seleccion-servicio')?.classList.add('hidden');
        
        // Resetear resumen de precios
        this.resetearResumenPrecios();
    }

    private resetearResumenPrecios(): void {
        const elementos = [
            'precio-base', 'descuento-aplicado', 'precio-extras', 'precio-final-calculado'
        ];
        
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = '$0.00';
        });
    }

    private async guardarVenta(): Promise<void> {
        const datosFormulario = this.obtenerDatosFormularioVenta();
        if (!datosFormulario) return;

        let exito = false;
        if (this.idEditando) {
            exito = await VentaOperations.modificar(this.idEditando, datosFormulario);
        } else {
            exito = await VentaOperations.insertar(datosFormulario);
        }

        if (exito) {
            this.ocultarModalVenta();
            this.actualizarDatos();
        }
    }

    private obtenerDatosFormularioVenta(): any {
        const stockId = (document.getElementById('stock-id') as HTMLSelectElement).value;
        const matricula = (document.getElementById('matricula') as HTMLInputElement).value.trim();
        const origenStock = (document.getElementById('origen-stock') as HTMLSelectElement).value;
        const clienteNombre = (document.getElementById('cliente-nombre') as HTMLInputElement).value.trim();
        const clienteNif = (document.getElementById('cliente-nif') as HTMLInputElement).value.trim();
        const clienteTelefono = (document.getElementById('cliente-telefono') as HTMLInputElement).value.trim();
        const fechaEntrega = (document.getElementById('fecha-entrega') as HTMLInputElement).value;
        const tipoVenta = (document.getElementById('tipo-venta') as HTMLSelectElement).value;
        const vendedorId = (document.getElementById('vendedor-id') as HTMLSelectElement).value || undefined;
        const servicioOficialId = (document.getElementById('servicio-oficial-id') as HTMLSelectElement).value || undefined;
        const modoPago = (document.getElementById('modo-pago') as HTMLSelectElement).value;
        const precioFinal = parseFloat((document.getElementById('precio-final') as HTMLInputElement).value) || 0;

        // Validaciones básicas
        if (!stockId || !matricula || !origenStock || !clienteNombre || !clienteNif || !clienteTelefono || !fechaEntrega || !tipoVenta || !modoPago || precioFinal <= 0) {
            alert('Por favor, complete todos los campos obligatorios');
            return null;
        }

        // Obtener extras seleccionados
        const extrasSeleccionados: { extraId: string; precio: number }[] = [];
        const checkboxes = document.querySelectorAll('.extra-checkbox:checked');
        checkboxes.forEach(checkbox => {
            const extraId = (checkbox as HTMLInputElement).dataset.extraId;
            const precio = parseFloat((checkbox as HTMLInputElement).dataset.precio || '0');
            if (extraId) {
                extrasSeleccionados.push({ extraId, precio });
            }
        });

        return {
            stockId,
            matricula: matricula.toUpperCase(),
            origenStock,
            clienteNombre,
            clienteNif: clienteNif.toUpperCase(),
            clienteTelefono,
            fechaEntrega,
            vendedorId,
            servicioOficialId,
            modoPago,
            precioFinal,
            extrasIncluidos: extrasSeleccionados
        };
    }

    private actualizarDatos(): void {
        this.cargarDatos();
        
        // Actualizar las opciones de vendedores en el filtro
        const filtroVendedor = document.getElementById('filtro-vendedor') as HTMLSelectElement;
        if (filtroVendedor) {
            const valorActual = filtroVendedor.value;
            filtroVendedor.innerHTML = `<option value="">Todos los vendedores</option>${this.obtenerOpcionesVendedores()}`;
            filtroVendedor.value = valorActual;
        }

        // Actualizar opciones de stock en el formulario
        const stockSelect = document.getElementById('stock-id') as HTMLSelectElement;
        if (stockSelect) {
            const valorActual = stockSelect.value;
            stockSelect.innerHTML = `<option value="">Seleccionar vehículo</option>${this.obtenerOpcionesStockDisponible()}`;
            stockSelect.value = valorActual;
        }
    }

    // Método requerido por el dashboardManager
    render(container: HTMLElement): void {
        this.renderizar(container);
    }
}