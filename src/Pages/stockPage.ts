import { StockOperations } from '../scripts/stockOperations';
import { AutomovilOperations } from '../scripts/automovilOperations';
import { ConcesionarioOperations } from '../scripts/concesionarioOperations';
import { ServicioOficialOperations } from '../scripts/servicioOficialOperations';
import { Stock } from '../Entidades/Stock';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class StockPage {
    private stocks: Stock[] = [];
    private stocksFiltrados: Stock[] = [];
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
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
                    <button id="btn-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>Nuevo Vehículo</span>
                    </button>
                </div>

                <!-- Búsqueda y Filtros -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div class="md:col-span-2">
                            <input type="text" id="entrada-busqueda" placeholder="Buscar por número de chasis, color o estado..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <select id="filtro-estado" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los estados</option>
                                ${CONSTANTS.STOCK_STATES.map(estado => 
                                    `<option value="${estado}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <select id="filtro-ubicacion" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las ubicaciones</option>
                                <option value="concesionario">Concesionario</option>
                                <option value="servicio_oficial">Servicio Oficial</option>
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número Chasis</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color/Km</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
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

                <!-- Modal Form -->
                <div id="modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 id="titulo-modal" class="text-lg font-medium text-gray-900">Nuevo Vehículo en Stock</h3>
                        </div>
                        <form id="formulario-stock" class="px-6 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Información del Vehículo -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Información del Vehículo</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Número de Chasis (VIN) *</label>
                                        <input type="text" id="numero-chasis" required 
                                               placeholder="WVW1K0AJ5EW123456"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <p class="text-xs text-gray-500 mt-1">17 caracteres alfanuméricos</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Modelo de Automóvil *</label>
                                        <select id="automovil-id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar modelo</option>
                                            ${this.obtenerOpcionesAutomoviles()}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                                        <select id="color" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar color</option>
                                            ${CONSTANTS.CAR_COLORS.map(color => 
                                                `<option value="${color}">${color}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
                                        <input type="number" id="kilometraje" min="0" max="500000" step="1" value="0"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <p class="text-xs text-gray-500 mt-1">Normalmente 0 para vehículos nuevos</p>
                                    </div>
                                </div>

                                <!-- Ubicación y Estado -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Ubicación y Estado</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Concesionario *</label>
                                        <select id="concesionario-id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar concesionario</option>
                                            ${this.obtenerOpcionesConcesionarios()}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                                        <select id="ubicacion" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar ubicación</option>
                                            <option value="concesionario">En Concesionario</option>
                                            <option value="servicio_oficial">En Servicio Oficial</option>
                                        </select>
                                    </div>
                                    
                                    <div id="servicio-oficial-container" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Servicio Oficial</label>
                                        <select id="servicio-oficial-id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar servicio oficial</option>
                                            ${this.obtenerOpcionesServiciosOficiales()}
                                        </select>
                                    </div>
                                    
                                    <div id="estado-container" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <select id="estado" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="disponible">Disponible</option>
                                            <option value="reservado">Reservado</option>
                                            <option value="vendido">Vendido</option>
                                        </select>
                                        <p class="text-xs text-gray-500 mt-1">Por defecto se crea como "Disponible"</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                            <button id="btn-cancelar" class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">
                                Cancelar
                            </button>
                            <button id="btn-guardar" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Modal de Cambio de Estado -->
                <div id="modal-estado" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-medium text-gray-900">Cambiar Estado</h3>
                        </div>
                        <div class="px-6 py-4">
                            <p class="text-sm text-gray-600 mb-4">Seleccione el nuevo estado para el vehículo:</p>
                            <select id="nuevo-estado" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="disponible">Disponible</option>
                                <option value="reservado">Reservado</option>
                                <option value="vendido">Vendido</option>
                            </select>
                        </div>
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                            <button id="btn-cancelar-estado" class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">
                                Cancelar
                            </button>
                            <button id="btn-confirmar-estado" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                                Confirmar
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
        this.stocks = StockOperations.listar();
        this.aplicarFiltros();
    }

    private aplicarFiltros(): void {
        let stocksFiltrados = StockOperations.buscar(this.terminoBusqueda);
        
        // Aplicar filtro de estado
        const estadoSeleccionado = (document.getElementById('filtro-estado') as HTMLSelectElement)?.value;
        if (estadoSeleccionado) {
            stocksFiltrados = stocksFiltrados.filter(stock => stock.estado === estadoSeleccionado);
        }

        // Aplicar filtro de ubicación
        const ubicacionSeleccionada = (document.getElementById('filtro-ubicacion') as HTMLSelectElement)?.value;
        if (ubicacionSeleccionada) {
            stocksFiltrados = stocksFiltrados.filter(stock => stock.ubicacion === ubicacionSeleccionada);
        }
        
        this.stocksFiltrados = stocksFiltrados;
        this.paginaActual = 1;
        this.renderizarTabla();
    }

    private obtenerOpcionesAutomoviles(): string {
        const automoviles = AutomovilOperations.listar();
        return automoviles.map(automovil => 
            `<option value="${automovil.id}">${automovil.marca} ${automovil.modelo} - ${Formatters.formatPrice(automovil.precio)}</option>`
        ).join('');
    }

    private obtenerOpcionesConcesionarios(): string {
        const concesionarios = ConcesionarioOperations.listar();
        return concesionarios.map(concesionario => 
            `<option value="${concesionario.id}">${concesionario.nombre}</option>`
        ).join('');
    }

    private obtenerOpcionesServiciosOficiales(): string {
        const serviciosOficiales = ServicioOficialOperations.listar();
        return serviciosOficiales.map(servicio => 
            `<option value="${servicio.id}">${servicio.nombre}</option>`
        ).join('');
    }

    private crearTarjetasEstadisticas(): string {
        const totalStock = this.stocks.length;
        const disponibles = this.stocks.filter(s => s.estado === 'disponible').length;
        const vendidos = this.stocks.filter(s => s.estado === 'vendido').length;
        const reservados = this.stocks.filter(s => s.estado === 'reservado').length;

        const estadisticas = [
            {
                titulo: 'Total Stock',
                valor: totalStock.toString(),
                icono: '📦',
                color: 'bg-blue-500'
            },
            {
                titulo: 'Disponibles',
                valor: disponibles.toString(),
                icono: '✅',
                color: 'bg-green-500'
            },
            {
                titulo: 'Vendidos',
                valor: vendidos.toString(),
                icono: '💰',
                color: 'bg-yellow-500'
            },
            {
                titulo: 'Reservados',
                valor: reservados.toString(),
                icono: '📋',
                color: 'bg-orange-500'
            }
        ];

        return estadisticas.map(stat => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <div class="flex items-center">
                    <div class="${stat.color} rounded-full p-3 text-white text-xl mr-3">
                        ${stat.icono}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">${stat.titulo}</p>
                        <p class="text-lg font-bold text-gray-900">${stat.valor}</p>
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
        const datosPaginados = this.stocksFiltrados.slice(indiceInicio, indiceFin);

        if (datosPaginados.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        ${this.terminoBusqueda ? 'No se encontraron resultados' : 'No hay vehículos en stock'}
                    </td>
                </tr>
            `;
        } else {
            cuerpoTabla.innerHTML = datosPaginados.map(stock => {
                const automovil = AutomovilOperations.obtenerPorId(stock.automovilId);
                const concesionario = ConcesionarioOperations.obtenerPorId(stock.concesionarioId);
                const servicioOficial = stock.servicioOficialId ? 
                    ServicioOficialOperations.obtenerPorId(stock.servicioOficialId) : null;

                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div class="h-10 w-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-xs">
                                        🚗
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">
                                        ${automovil ? `${automovil.marca} ${automovil.modelo}` : 'N/A'}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        ${automovil ? `${automovil.combustible} - ${automovil.potenciaFiscal} CV` : ''}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-mono text-gray-900">${Formatters.formatVIN(stock.numeroChasis)}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${stock.color}</div>
                            <div class="text-sm text-gray-500">${stock.kilometraje.toLocaleString()} km</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.obtenerColorEstado(stock.estado)}">
                                ${stock.estado.charAt(0).toUpperCase() + stock.estado.slice(1)}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>${stock.ubicacion === 'concesionario' ? 'Concesionario' : 'Servicio Oficial'}</div>
                            <div class="text-blue-600">
                                ${stock.ubicacion === 'concesionario' ? 
                                    (concesionario ? concesionario.nombre : 'N/A') : 
                                    (servicioOficial ? servicioOficial.nombre : 'N/A')
                                }
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${Formatters.formatDate(stock.fechaIngreso)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button onclick="stockPage.editarStock('${stock.id}')" 
                                        class="text-blue-600 hover:text-blue-900" title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="stockPage.cambiarEstado('${stock.id}', '${stock.estado}')" 
                                        class="text-green-600 hover:text-green-900" title="Cambiar estado">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                    </svg>
                                </button>
                                <button onclick="stockPage.eliminarStock('${stock.id}')" 
                                        class="text-red-600 hover:text-red-900" title="Eliminar">
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

    private obtenerColorEstado(estado: string): string {
        switch (estado) {
            case 'disponible':
                return 'bg-green-100 text-green-800';
            case 'vendido':
                return 'bg-blue-100 text-blue-800';
            case 'reservado':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    private renderizarPaginacion(): void {
        const paginacion = document.getElementById('paginacion');
        if (!paginacion) return;

        const totalPaginas = Utils.getTotalPages(this.stocksFiltrados.length, this.tamañoPagina);
        const elementoInicio = (this.paginaActual - 1) * this.tamañoPagina + 1;
        const elementoFin = Math.min(this.paginaActual * this.tamañoPagina, this.stocksFiltrados.length);

        paginacion.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                        onclick="stockPage.cambiarPagina(${this.paginaActual - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                        onclick="stockPage.cambiarPagina(${this.paginaActual + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${elementoInicio}</span> a <span class="font-medium">${elementoFin}</span> de
                        <span class="font-medium">${this.stocksFiltrados.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                                onclick="stockPage.cambiarPagina(${this.paginaActual - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generarNumerosPagina(totalPaginas)}
                        <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                                onclick="stockPage.cambiarPagina(${this.paginaActual + 1})"
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
                <button onclick="stockPage.cambiarPagina(${i})"
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
        (window as any).stockPage = this;

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
        const filtroEstado = document.getElementById('filtro-estado') as HTMLSelectElement;
        const filtroUbicacion = document.getElementById('filtro-ubicacion') as HTMLSelectElement;
        
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => this.aplicarFiltros());
        }
        
        if (filtroUbicacion) {
            filtroUbicacion.addEventListener('change', () => this.aplicarFiltros());
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

        // Control de ubicación en formulario
        const ubicacionSelect = document.getElementById('ubicacion') as HTMLSelectElement;
        const servicioOficialContainer = document.getElementById('servicio-oficial-container');
        
        if (ubicacionSelect && servicioOficialContainer) {
            ubicacionSelect.addEventListener('change', (e) => {
                const valor = (e.target as HTMLSelectElement).value;
                if (valor === 'servicio_oficial') {
                    servicioOficialContainer.classList.remove('hidden');
                    (document.getElementById('servicio-oficial-id') as HTMLSelectElement).required = true;
                } else {
                    servicioOficialContainer.classList.add('hidden');
                    (document.getElementById('servicio-oficial-id') as HTMLSelectElement).required = false;
                }
            });
        }

        // Botones principales
        document.getElementById('btn-nuevo')?.addEventListener('click', () => this.mostrarModal());
        document.getElementById('btn-actualizar')?.addEventListener('click', () => this.actualizarDatos());
        document.getElementById('btn-cancelar')?.addEventListener('click', () => this.ocultarModal());
        document.getElementById('btn-guardar')?.addEventListener('click', () => this.guardarStock());

        // Botones de modal de estado
        document.getElementById('btn-cancelar-estado')?.addEventListener('click', () => this.ocultarModalEstado());
        document.getElementById('btn-confirmar-estado')?.addEventListener('click', () => this.confirmarCambioEstado());

        // Modales
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModal();
        });
        
        document.getElementById('modal-estado')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModalEstado();
        });
    }

    // Variables para cambio de estado
    private stockIdCambioEstado: string | null = null;

    // Métodos públicos para ser llamados desde el HTML
    public cambiarPagina(pagina: number): void {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    public editarStock(id: string): void {
        const stock = StockOperations.obtenerPorId(id);
        if (stock) {
            this.idEditando = id;
            this.mostrarModal(stock);
        }
    }

    public cambiarEstado(id: string, estadoActual: string): void {
        this.stockIdCambioEstado = id;
        this.mostrarModalEstado(estadoActual);
    }

    public async eliminarStock(id: string): Promise<void> {
        const exito = await StockOperations.eliminar(id);
        if (exito) {
            this.actualizarDatos();
        }
    }

    private mostrarModal(stock?: Stock): void {
        const modal = document.getElementById('modal');
        const titulo = document.getElementById('titulo-modal');
        const estadoContainer = document.getElementById('estado-container');
        
        if (stock) {
            titulo!.textContent = 'Editar Vehículo en Stock';
            estadoContainer?.classList.remove('hidden');
            this.llenarFormulario(stock);
        } else {
            titulo!.textContent = 'Nuevo Vehículo en Stock';
            estadoContainer?.classList.add('hidden');
            this.limpiarFormulario();
        }
        
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    }

    private ocultarModal(): void {
        const modal = document.getElementById('modal');
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
        this.idEditando = null;
        this.limpiarFormulario();
    }

    private mostrarModalEstado(estadoActual: string): void {
        const modal = document.getElementById('modal-estado');
        const selectEstado = document.getElementById('nuevo-estado') as HTMLSelectElement;
        
        if (selectEstado) {
            selectEstado.value = estadoActual;
        }
        
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    }

    private ocultarModalEstado(): void {
        const modal = document.getElementById('modal-estado');
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
        this.stockIdCambioEstado = null;
    }

    private async confirmarCambioEstado(): Promise<void> {
        if (!this.stockIdCambioEstado) return;
        
        const nuevoEstado = (document.getElementById('nuevo-estado') as HTMLSelectElement).value as 'disponible' | 'vendido' | 'reservado';
        const exito = await StockOperations.cambiarEstado(this.stockIdCambioEstado, nuevoEstado);
        
        if (exito) {
            this.ocultarModalEstado();
            this.actualizarDatos();
        }
    }

    private llenarFormulario(stock: Stock): void {
        (document.getElementById('numero-chasis') as HTMLInputElement).value = stock.numeroChasis;
        (document.getElementById('automovil-id') as HTMLSelectElement).value = stock.automovilId;
        (document.getElementById('color') as HTMLSelectElement).value = stock.color;
        (document.getElementById('kilometraje') as HTMLInputElement).value = stock.kilometraje.toString();
        (document.getElementById('concesionario-id') as HTMLSelectElement).value = stock.concesionarioId;
        (document.getElementById('ubicacion') as HTMLSelectElement).value = stock.ubicacion;
        (document.getElementById('estado') as HTMLSelectElement).value = stock.estado;
        
        if (stock.servicioOficialId) {
            (document.getElementById('servicio-oficial-id') as HTMLSelectElement).value = stock.servicioOficialId;
            document.getElementById('servicio-oficial-container')?.classList.remove('hidden');
        }

        // Trigger del evento change para mostrar/ocultar servicio oficial
        const ubicacionSelect = document.getElementById('ubicacion') as HTMLSelectElement;
        ubicacionSelect.dispatchEvent(new Event('change'));
    }

    private limpiarFormulario(): void {
        const formulario = document.getElementById('formulario-stock') as HTMLFormElement;
        formulario.reset();
        
        document.getElementById('servicio-oficial-container')?.classList.add('hidden');
        (document.getElementById('servicio-oficial-id') as HTMLSelectElement).required = false;
    }

    private async guardarStock(): Promise<void> {
        const datosFormulario = this.obtenerDatosFormulario();
        if (!datosFormulario) return;

        let exito = false;
        if (this.idEditando) {
            exito = await StockOperations.modificar(this.idEditando, datosFormulario);
        } else {
            exito = await StockOperations.insertar(datosFormulario);
        }

        if (exito) {
            this.ocultarModal();
            this.actualizarDatos();
        }
    }

    private obtenerDatosFormulario(): any {
        const numeroChasis = (document.getElementById('numero-chasis') as HTMLInputElement).value.trim();
        const automovilId = (document.getElementById('automovil-id') as HTMLSelectElement).value;
        const color = (document.getElementById('color') as HTMLSelectElement).value;
        const kilometraje = parseInt((document.getElementById('kilometraje') as HTMLInputElement).value) || 0;
        const concesionarioId = (document.getElementById('concesionario-id') as HTMLSelectElement).value;
        const ubicacion = (document.getElementById('ubicacion') as HTMLSelectElement).value;
        const servicioOficialId = (document.getElementById('servicio-oficial-id') as HTMLSelectElement).value || undefined;
        const estado = (document.getElementById('estado') as HTMLSelectElement).value || 'disponible';

        if (!numeroChasis || !automovilId || !color || !concesionarioId || !ubicacion) {
            alert('Por favor, complete todos los campos obligatorios');
            return null;
        }

        if (ubicacion === 'servicio_oficial' && !servicioOficialId) {
            alert('Debe seleccionar un servicio oficial');
            return null;
        }

        return {
            numeroChasis, automovilId, color, kilometraje, concesionarioId, 
            ubicacion, servicioOficialId, estado
        };
    }

    private actualizarDatos(): void {
        this.cargarDatos();
        // Actualizar las opciones de los selects
        const automovilSelect = document.getElementById('automovil-id') as HTMLSelectElement;
        const concesionarioSelect = document.getElementById('concesionario-id') as HTMLSelectElement;
        const servicioOficialSelect = document.getElementById('servicio-oficial-id') as HTMLSelectElement;
        
        if (automovilSelect) {
            const valorActual = automovilSelect.value;
            automovilSelect.innerHTML = `<option value="">Seleccionar modelo</option>${this.obtenerOpcionesAutomoviles()}`;
            automovilSelect.value = valorActual;
        }
        
        if (concesionarioSelect) {
            const valorActual = concesionarioSelect.value;
            concesionarioSelect.innerHTML = `<option value="">Seleccionar concesionario</option>${this.obtenerOpcionesConcesionarios()}`;
            concesionarioSelect.value = valorActual;
        }
        
        if (servicioOficialSelect) {
            const valorActual = servicioOficialSelect.value;
            servicioOficialSelect.innerHTML = `<option value="">Seleccionar servicio oficial</option>${this.obtenerOpcionesServiciosOficiales()}`;
            servicioOficialSelect.value = valorActual;
        }
    }

    // Método requerido por el dashboardManager
    render(container: HTMLElement): void {
        this.renderizar(container);
    }
}