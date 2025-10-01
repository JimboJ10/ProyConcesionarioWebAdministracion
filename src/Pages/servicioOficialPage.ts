import { ServicioOficialOperations } from '../scripts/servicioOficialOperations';
import { ConcesionarioOperations } from '../scripts/concesionarioOperations';
import { StockOperations } from '../scripts/stockOperations';
import { ServicioOficial } from '../Entidades/ServicioOficial';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class ServicioOficialPage {
    private serviciosOficiales: ServicioOficial[] = [];
    private serviciosEtiltrados: ServicioOficial[] = [];
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
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Servicios Oficiales</h1>
                    <button id="btn-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>Nuevo Servicio Oficial</span>
                    </button>
                </div>

                <!-- Búsqueda y Filtros -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <input type="text" id="entrada-busqueda" placeholder="Buscar por nombre, NIF, dirección o email..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <select id="filtro-concesionario" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los concesionarios</option>
                                ${this.obtenerOpcionesConcesionarios()}
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio Oficial</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIF</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículos</th>
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
                            <h3 id="titulo-modal" class="text-lg font-medium text-gray-900">Nuevo Servicio Oficial</h3>
                        </div>
                        <form id="formulario-servicio" class="px-6 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Información Básica -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Información Básica</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio *</label>
                                        <input type="text" id="nombre" required 
                                               placeholder="AutoMax Norte"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">NIF/CIF *</label>
                                        <input type="text" id="nif" required 
                                               placeholder="C12345678"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                                        <textarea id="direccion" required rows="3"
                                                  placeholder="Av. Principal 123, Ciudad"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                </div>

                                <!-- Contacto y Concesionario -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Contacto y Asociación</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                        <input type="tel" id="telefono" required 
                                               placeholder="923456789"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" id="email" required 
                                               placeholder="servicio@concesionario.com"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Concesionario Principal *</label>
                                        <select id="concesionario-id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar concesionario</option>
                                            ${this.obtenerOpcionesConcesionarios()}
                                        </select>
                                        <p class="text-xs text-gray-500 mt-1">Concesionario del que depende este servicio oficial</p>
                                    </div>

                                    <!-- Información del Concesionario Seleccionado -->
                                    <div id="info-concesionario" class="hidden">
                                        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                                            <h5 class="text-sm font-medium text-blue-800 mb-2">Información del Concesionario</h5>
                                            <div id="detalles-concesionario" class="text-xs text-blue-600">
                                                <!-- Se cargará dinámicamente -->
                                            </div>
                                        </div>
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

                <!-- Modal de Detalles -->
                <div id="modal-detalles" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-medium text-gray-900">Detalles del Servicio Oficial</h3>
                        </div>
                        <div id="contenido-detalles" class="px-6 py-4">
                            <!-- Se cargará dinámicamente -->
                        </div>
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button id="btn-cerrar-detalles" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md">
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
        this.serviciosOficiales = ServicioOficialOperations.listar();
        this.aplicarFiltros();
    }

    private aplicarFiltros(): void {
        let serviciosEtiltrados = ServicioOficialOperations.buscar(this.terminoBusqueda);
        
        // Aplicar filtro de concesionario
        const concesionarioSeleccionado = (document.getElementById('filtro-concesionario') as HTMLSelectElement)?.value;
        if (concesionarioSeleccionado) {
            serviciosEtiltrados = serviciosEtiltrados.filter(servicio => servicio.concesionarioId === concesionarioSeleccionado);
        }
        
        this.serviciosEtiltrados = serviciosEtiltrados;
        this.paginaActual = 1;
        this.renderizarTabla();
    }

    private obtenerOpcionesConcesionarios(): string {
        const concesionarios = ConcesionarioOperations.listar();
        return concesionarios.map(concesionario => 
            `<option value="${concesionario.id}">${concesionario.nombre}</option>`
        ).join('');
    }

    private crearTarjetasEstadisticas(): string {
        const totalServicios = this.serviciosOficiales.length;
        const concesionariosConServicios = new Set(this.serviciosOficiales.map(s => s.concesionarioId)).size;
        const vehiculosEnServicios = StockOperations.listar().filter(s => s.ubicacion === 'servicio_oficial').length;
        const serviciosActivos = this.serviciosOficiales.length; // Asumiendo que todos están activos

        const estadisticas = [
            {
                titulo: 'Total Servicios',
                valor: totalServicios.toString(),
                icono: '🏪',
                color: 'bg-blue-500'
            },
            {
                titulo: 'Concesionarios',
                valor: concesionariosConServicios.toString(),
                icono: '🏢',
                color: 'bg-green-500'
            },
            {
                titulo: 'Vehículos en Servicios',
                valor: vehiculosEnServicios.toString(),
                icono: '🚗',
                color: 'bg-yellow-500'
            },
            {
                titulo: 'Servicios Activos',
                valor: serviciosActivos.toString(),
                icono: '✅',
                color: 'bg-purple-500'
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
        const datosPaginados = this.serviciosEtiltrados.slice(indiceInicio, indiceFin);

        if (datosPaginados.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        ${this.terminoBusqueda ? 'No se encontraron resultados' : 'No hay servicios oficiales registrados'}
                    </td>
                </tr>
            `;
        } else {
            cuerpoTabla.innerHTML = datosPaginados.map(servicio => {
                const concesionario = ConcesionarioOperations.obtenerPorId(servicio.concesionarioId);
                const vehiculosEnServicio = StockOperations.listar().filter(s => s.servicioOficialId === servicio.id);
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                        🏪
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${servicio.nombre}</div>
                                    <div class="text-sm text-gray-500">${servicio.direccion}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${Formatters.formatNIF(servicio.nif)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>${Formatters.formatPhone(servicio.telefono)}</div>
                            <div class="text-blue-600">${servicio.email}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ${concesionario ? concesionario.nombre : 'N/A'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div class="flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ${vehiculosEnServicio.length} vehículos
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button onclick="servicioOficialPage.verDetalles('${servicio.id}')" 
                                        class="text-purple-600 hover:text-purple-900" title="Ver detalles">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                <button onclick="servicioOficialPage.editarServicio('${servicio.id}')" 
                                        class="text-blue-600 hover:text-blue-900" title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="servicioOficialPage.verVehiculos('${servicio.id}')" 
                                        class="text-green-600 hover:text-green-900" title="Ver vehículos">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </button>
                                <button onclick="servicioOficialPage.eliminarServicio('${servicio.id}')" 
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

    private renderizarPaginacion(): void {
        const paginacion = document.getElementById('paginacion');
        if (!paginacion) return;

        const totalPaginas = Utils.getTotalPages(this.serviciosEtiltrados.length, this.tamañoPagina);
        const elementoInicio = (this.paginaActual - 1) * this.tamañoPagina + 1;
        const elementoFin = Math.min(this.paginaActual * this.tamañoPagina, this.serviciosEtiltrados.length);

        paginacion.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                        onclick="servicioOficialPage.cambiarPagina(${this.paginaActual - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                        onclick="servicioOficialPage.cambiarPagina(${this.paginaActual + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${elementoInicio}</span> a <span class="font-medium">${elementoFin}</span> de{' '}
                        <span class="font-medium">${this.serviciosEtiltrados.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                                onclick="servicioOficialPage.cambiarPagina(${this.paginaActual - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generarNumerosPagina(totalPaginas)}
                        <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                                onclick="servicioOficialPage.cambiarPagina(${this.paginaActual + 1})"
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
                <button onclick="servicioOficialPage.cambiarPagina(${i})"
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
        (window as any).servicioOficialPage = this;

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

        // Filtro de concesionario
        const filtroConcesionario = document.getElementById('filtro-concesionario') as HTMLSelectElement;
        if (filtroConcesionario) {
            filtroConcesionario.addEventListener('change', () => {
                this.aplicarFiltros();
            });
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

        // Cambio de concesionario en formulario
        const concesionarioSelect = document.getElementById('concesionario-id') as HTMLSelectElement;
        if (concesionarioSelect) {
            concesionarioSelect.addEventListener('change', (e) => {
                this.mostrarInfoConcesionario((e.target as HTMLSelectElement).value);
            });
        }

        // Botones principales
        document.getElementById('btn-nuevo')?.addEventListener('click', () => this.mostrarModal());
        document.getElementById('btn-actualizar')?.addEventListener('click', () => this.actualizarDatos());
        document.getElementById('btn-cancelar')?.addEventListener('click', () => this.ocultarModal());
        document.getElementById('btn-guardar')?.addEventListener('click', () => this.guardarServicio());
        document.getElementById('btn-cerrar-detalles')?.addEventListener('click', () => this.ocultarModalDetalles());

        // Modales
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModal();
        });
        
        document.getElementById('modal-detalles')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModalDetalles();
        });
    }

    private mostrarInfoConcesionario(concesionarioId: string): void {
        const infoContainer = document.getElementById('info-concesionario');
        const detallesContainer = document.getElementById('detalles-concesionario');
        
        if (!concesionarioId) {
            infoContainer?.classList.add('hidden');
            return;
        }

        const concesionario = ConcesionarioOperations.obtenerPorId(concesionarioId);
        if (concesionario && detallesContainer) {
            detallesContainer.innerHTML = `
                <div><strong>Nombre:</strong> ${concesionario.nombre}</div>
                <div><strong>Dirección:</strong> ${concesionario.direccion}</div>
                <div><strong>Teléfono:</strong> ${Formatters.formatPhone(concesionario.telefono)}</div>
                <div><strong>Marcas:</strong> ${concesionario.marcas.join(', ') || 'No especificadas'}</div>
            `;
            infoContainer?.classList.remove('hidden');
        }
    }

    // Métodos públicos para ser llamados desde el HTML
    public cambiarPagina(pagina: number): void {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    public editarServicio(id: string): void {
        const servicio = ServicioOficialOperations.obtenerPorId(id);
        if (servicio) {
            this.idEditando = id;
            this.mostrarModal(servicio);
        }
    }

    public verDetalles(id: string): void {
        const servicio = ServicioOficialOperations.obtenerPorId(id);
        if (servicio) {
            this.mostrarModalDetalles(servicio);
        }
    }

    public verVehiculos(id: string): void {
        // Aquí podrías implementar navegación a la página de stock filtrada por servicio oficial
        console.log(`Ver vehículos del servicio oficial: ${id}`);
        alert('Funcionalidad de ver vehículos - Redirigir a página de stock filtrada');
    }

    public async eliminarServicio(id: string): Promise<void> {
        const exito = await ServicioOficialOperations.eliminar(id);
        if (exito) {
            this.actualizarDatos();
        }
    }

    private mostrarModal(servicio?: ServicioOficial): void {
        const modal = document.getElementById('modal');
        const titulo = document.getElementById('titulo-modal');
        
        if (servicio) {
            titulo!.textContent = 'Editar Servicio Oficial';
            this.llenarFormulario(servicio);
        } else {
            titulo!.textContent = 'Nuevo Servicio Oficial';
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

    private mostrarModalDetalles(servicio: ServicioOficial): void {
        const modal = document.getElementById('modal-detalles');
        const contenido = document.getElementById('contenido-detalles');
        
        if (contenido) {
            const concesionario = ConcesionarioOperations.obtenerPorId(servicio.concesionarioId);
            const vehiculos = StockOperations.listar().filter(s => s.servicioOficialId === servicio.id);
            
            contenido.innerHTML = `
                <div class="space-y-6">
                    <!-- Información Básica -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Información Básica</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Nombre</label>
                                <p class="text-sm text-gray-900">${servicio.nombre}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">NIF</label>
                                <p class="text-sm text-gray-900">${Formatters.formatNIF(servicio.nif)}</p>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-sm font-medium text-gray-600">Dirección</label>
                                <p class="text-sm text-gray-900">${servicio.direccion}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Teléfono</label>
                                <p class="text-sm text-gray-900">${Formatters.formatPhone(servicio.telefono)}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Email</label>
                                <p class="text-sm text-blue-600">${servicio.email}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Concesionario Principal -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Concesionario Principal</h4>
                        ${concesionario ? `
                            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Nombre</label>
                                        <p class="text-sm text-blue-900">${concesionario.nombre}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">NIF</label>
                                        <p class="text-sm text-blue-900">${Formatters.formatNIF(concesionario.nif)}</p>
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium text-blue-600">Dirección</label>
                                        <p class="text-sm text-blue-900">${concesionario.direccion}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Marcas</label>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            ${concesionario.marcas.map(marca => 
                                                `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${marca}</span>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : '<p class="text-gray-500">Concesionario no encontrado</p>'}
                    </div>

                    <!-- Vehículos en el Servicio -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Vehículos en el Servicio</h4>
                        ${vehiculos.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chasis</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha Ingreso</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        ${vehiculos.map(vehiculo => `
                                            <tr>
                                                <td class="px-3 py-2 font-mono text-xs">${Formatters.formatVIN(vehiculo.numeroChasis)}</td>
                                                <td class="px-3 py-2">${vehiculo.color}</td>
                                                <td class="px-3 py-2">
                                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        vehiculo.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                                                        vehiculo.estado === 'vendido' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }">
                                                        ${vehiculo.estado.charAt(0).toUpperCase() + vehiculo.estado.slice(1)}
                                                    </span>
                                                </td>
                                                <td class="px-3 py-2">${Formatters.formatDate(vehiculo.fechaIngreso)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : '<p class="text-gray-500">No hay vehículos en este servicio oficial</p>'}
                    </div>
                </div>
            `;
        }
        
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    }

    private ocultarModalDetalles(): void {
        const modal = document.getElementById('modal-detalles');
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    }

    private llenarFormulario(servicio: ServicioOficial): void {
        (document.getElementById('nombre') as HTMLInputElement).value = servicio.nombre;
        (document.getElementById('nif') as HTMLInputElement).value = servicio.nif;
        (document.getElementById('direccion') as HTMLTextAreaElement).value = servicio.direccion;
        (document.getElementById('telefono') as HTMLInputElement).value = servicio.telefono;
        (document.getElementById('email') as HTMLInputElement).value = servicio.email;
        (document.getElementById('concesionario-id') as HTMLSelectElement).value = servicio.concesionarioId;
        
        // Mostrar información del concesionario
        this.mostrarInfoConcesionario(servicio.concesionarioId);
    }

    private limpiarFormulario(): void {
        const formulario = document.getElementById('formulario-servicio') as HTMLFormElement;
        formulario.reset();
        
        // Ocultar información del concesionario
        document.getElementById('info-concesionario')?.classList.add('hidden');
    }

    private async guardarServicio(): Promise<void> {
        const datosFormulario = this.obtenerDatosFormulario();
        if (!datosFormulario) return;

        let exito = false;
        if (this.idEditando) {
            exito = await ServicioOficialOperations.modificar(this.idEditando, datosFormulario);
        } else {
            exito = await ServicioOficialOperations.insertar(datosFormulario);
        }

        if (exito) {
            this.ocultarModal();
            this.actualizarDatos();
        }
    }

    private obtenerDatosFormulario(): any {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const nif = (document.getElementById('nif') as HTMLInputElement).value.trim();
        const direccion = (document.getElementById('direccion') as HTMLTextAreaElement).value.trim();
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();
        const concesionarioId = (document.getElementById('concesionario-id') as HTMLSelectElement).value;

        if (!nombre || !nif || !direccion || !telefono || !email || !concesionarioId) {
            alert('Por favor, complete todos los campos obligatorios');
            return null;
        }

        return { nombre, nif, direccion, telefono, email, concesionarioId };
    }

    private actualizarDatos(): void {
        this.cargarDatos();
        // Actualizar las opciones de concesionarios en los selects
        const filtro = document.getElementById('filtro-concesionario') as HTMLSelectElement;
        const formulario = document.getElementById('concesionario-id') as HTMLSelectElement;
        if (filtro) {
            const valorActual = filtro.value;
            filtro.innerHTML = `<option value="">Todos los concesionarios</option>${this.obtenerOpcionesConcesionarios()}`;
            filtro.value = valorActual;
        }
        if (formulario) {
            const valorActual = formulario.value;
            formulario.innerHTML = `<option value="">Seleccionar concesionario</option>${this.obtenerOpcionesConcesionarios()}`;
            formulario.value = valorActual;
        }
    }

    // Método requerido por el dashboardManager
    render(container: HTMLElement): void {
        this.renderizar(container);
    }
}