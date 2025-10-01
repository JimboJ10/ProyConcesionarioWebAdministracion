import { EquipamientoOperations } from '../scripts/equipamientoOperations';
import { AutomovilOperations } from '../scripts/automovilOperations';
import { ExtraOperations } from '../scripts/extraOperations';
import { Equipamiento } from '../Entidades/Equipamiento';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class EquipamientoPage {
    private equipamientos: Equipamiento[] = [];
    private equipamientosEtiltrados: Equipamiento[] = [];
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
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Equipamientos</h1>
                    <button id="btn-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>Nuevo Equipamiento</span>
                    </button>
                </div>

                <!-- Búsqueda y Filtros -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <input type="text" id="entrada-busqueda" placeholder="Buscar por nombre, descripción o categoría..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <select id="filtro-categoria" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las categorías</option>
                                ${this.obtenerOpcionesCategorias()}
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamiento</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículos</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extras Relacionados</th>
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
                    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 id="titulo-modal" class="text-lg font-medium text-gray-900">Nuevo Equipamiento</h3>
                        </div>
                        <form id="formulario-equipamiento" class="px-6 py-4">
                            <div class="space-y-4">
                                <!-- Información Básica -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Equipamiento *</label>
                                    <input type="text" id="nombre" required 
                                           placeholder="Ej: Sistema ABS"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <p class="text-xs text-gray-500 mt-1">Nombre descriptivo del equipamiento</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                                    <textarea id="descripcion" required rows="3"
                                              placeholder="Descripción detallada del equipamiento y sus características..."
                                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    <p class="text-xs text-gray-500 mt-1">Descripción técnica completa</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                    <select id="categoria" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Seleccionar categoría</option>
                                        ${CONSTANTS.EQUIPMENT_CATEGORIES.map(categoria => 
                                            `<option value="${categoria}">${categoria}</option>`
                                        ).join('')}
                                    </select>
                                    <p class="text-xs text-gray-500 mt-1">Tipo de equipamiento según su función</p>
                                </div>

                                <!-- Información Adicional -->
                                <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <h4 class="text-sm font-medium text-blue-800 mb-2">💡 Información sobre Equipamientos</h4>
                                    <ul class="text-xs text-blue-600 space-y-1">
                                        <li>• <strong>Seguridad:</strong> ABS, airbags, control de estabilidad</li>
                                        <li>• <strong>Confort:</strong> Aire acondicionado, asientos eléctricos</li>
                                        <li>• <strong>Tecnología:</strong> GPS, pantallas táctiles, conectividad</li>
                                        <li>• <strong>Estética:</strong> Llantas, molduras, iluminación LED</li>
                                        <li>• <strong>Rendimiento:</strong> Turbo, suspensiones deportivas</li>
                                    </ul>
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
                            <h3 class="text-lg font-medium text-gray-900">Detalles del Equipamiento</h3>
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
        this.equipamientos = EquipamientoOperations.listar();
        this.aplicarFiltros();
    }

    private aplicarFiltros(): void {
        let equipamientosEtiltrados = EquipamientoOperations.buscar(this.terminoBusqueda);
        
        // Aplicar filtro de categoría
        const categoriaSeleccionada = (document.getElementById('filtro-categoria') as HTMLSelectElement)?.value;
        if (categoriaSeleccionada) {
            equipamientosEtiltrados = equipamientosEtiltrados.filter(equipamiento => 
                equipamiento.categoria === categoriaSeleccionada
            );
        }
        
        this.equipamientosEtiltrados = equipamientosEtiltrados;
        this.paginaActual = 1;
        this.renderizarTabla();
    }

    private obtenerOpcionesCategorias(): string {
        const categorias = EquipamientoOperations.obtenerCategorias();
        return categorias.map(categoria => 
            `<option value="${categoria}">${categoria}</option>`
        ).join('');
    }

    private crearTarjetasEstadisticas(): string {
        const totalEquipamientos = this.equipamientos.length;
        const categoriasActivas = new Set(this.equipamientos.map(e => e.categoria)).size;
        const equipamientosEnUso = this.contarEquipamientosEnUso();
        const extrasRelacionados = this.contarExtrasRelacionados();

        const estadisticas = [
            {
                titulo: 'Total Equipamientos',
                valor: totalEquipamientos.toString(),
                icono: '⚙️',
                color: 'bg-blue-500'
            },
            {
                titulo: 'Categorías Activas',
                valor: categoriasActivas.toString(),
                icono: '📂',
                color: 'bg-green-500'
            },
            {
                titulo: 'En Uso en Vehículos',
                valor: equipamientosEnUso.toString(),
                icono: '🚗',
                color: 'bg-purple-500'
            },
            {
                titulo: 'Extras Relacionados',
                valor: extrasRelacionados.toString(),
                icono: '✨',
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

    private contarEquipamientosEnUso(): number {
        const automoviles = AutomovilOperations.listar();
        const equipamientosEnUso = new Set<string>();
        
        automoviles.forEach(auto => {
            auto.equipamientoSerie.forEach(equipId => {
                equipamientosEnUso.add(equipId);
            });
        });
        
        return equipamientosEnUso.size;
    }

    private contarExtrasRelacionados(): number {
        const extras = ExtraOperations.listar();
        return extras.filter(extra => extra.equipamientoId).length;
    }

    private renderizarTabla(): void {
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        if (!cuerpoTabla) return;

        const indiceInicio = (this.paginaActual - 1) * this.tamañoPagina;
        const indiceFin = indiceInicio + this.tamañoPagina;
        const datosPaginados = this.equipamientosEtiltrados.slice(indiceInicio, indiceFin);

        if (datosPaginados.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        ${this.terminoBusqueda ? 'No se encontraron resultados' : 'No hay equipamientos registrados'}
                    </td>
                </tr>
            `;
        } else {
            cuerpoTabla.innerHTML = datosPaginados.map(equipamiento => {
                const vehiculosConEquipamiento = this.contarVehiculosConEquipamiento(equipamiento.id);
                const extrasRelacionados = this.obtenerExtrasRelacionados(equipamiento.id);
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div class="h-10 w-10 rounded-full ${this.obtenerColorCategoria(equipamiento.categoria)} flex items-center justify-center text-white font-semibold">
                                        ${this.obtenerIconoCategoria(equipamiento.categoria)}
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${equipamiento.nombre}</div>
                                    <div class="text-sm text-gray-500">${this.truncarTexto(equipamiento.descripcion, 50)}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.obtenerColorCategoria(equipamiento.categoria)} text-white">
                                ${equipamiento.categoria}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div class="flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    ${vehiculosConEquipamiento} vehículos
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div class="flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ${extrasRelacionados.length} extras
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button onclick="equipamientoPage.verDetalles('${equipamiento.id}')" 
                                        class="text-purple-600 hover:text-purple-900" title="Ver detalles">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                <button onclick="equipamientoPage.editarEquipamiento('${equipamiento.id}')" 
                                        class="text-blue-600 hover:text-blue-900" title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="equipamientoPage.verVehiculos('${equipamiento.id}')" 
                                        class="text-green-600 hover:text-green-900" title="Ver vehículos">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </button>
                                <button onclick="equipamientoPage.eliminarEquipamiento('${equipamiento.id}')" 
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

    private obtenerColorCategoria(categoria: string): string {
        switch (categoria.toLowerCase()) {
            case 'seguridad':
                return 'bg-red-500';
            case 'confort':
                return 'bg-blue-500';
            case 'tecnología':
                return 'bg-purple-500';
            case 'estética':
                return 'bg-green-500';
            case 'rendimiento':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    }

    private obtenerIconoCategoria(categoria: string): string {
        switch (categoria.toLowerCase()) {
            case 'seguridad':
                return '🛡️';
            case 'confort':
                return '💺';
            case 'tecnología':
                return '📱';
            case 'estética':
                return '✨';
            case 'rendimiento':
                return '⚡';
            default:
                return '⚙️';
        }
    }

    private contarVehiculosConEquipamiento(equipamientoId: string): number {
        const automoviles = AutomovilOperations.listar();
        return automoviles.filter(auto => auto.equipamientoSerie.includes(equipamientoId)).length;
    }

    private obtenerExtrasRelacionados(equipamientoId: string): any[] {
        const extras = ExtraOperations.listar();
        return extras.filter(extra => extra.equipamientoId === equipamientoId);
    }

    private truncarTexto(texto: string, maxLength: number): string {
        return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
    }

    private renderizarPaginacion(): void {
        const paginacion = document.getElementById('paginacion');
        if (!paginacion) return;

        const totalPaginas = Utils.getTotalPages(this.equipamientosEtiltrados.length, this.tamañoPagina);
        const elementoInicio = (this.paginaActual - 1) * this.tamañoPagina + 1;
        const elementoFin = Math.min(this.paginaActual * this.tamañoPagina, this.equipamientosEtiltrados.length);

        paginacion.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                        onclick="equipamientoPage.cambiarPagina(${this.paginaActual - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                        onclick="equipamientoPage.cambiarPagina(${this.paginaActual + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${elementoInicio}</span> a <span class="font-medium">${elementoFin}</span> de{' '}
                        <span class="font-medium">${this.equipamientosEtiltrados.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                                onclick="equipamientoPage.cambiarPagina(${this.paginaActual - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generarNumerosPagina(totalPaginas)}
                        <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                                onclick="equipamientoPage.cambiarPagina(${this.paginaActual + 1})"
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
                <button onclick="equipamientoPage.cambiarPagina(${i})"
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
        (window as any).equipamientoPage = this;

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

        // Filtro de categoría
        const filtroCategoria = document.getElementById('filtro-categoria') as HTMLSelectElement;
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => {
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

        // Botones principales
        document.getElementById('btn-nuevo')?.addEventListener('click', () => this.mostrarModal());
        document.getElementById('btn-actualizar')?.addEventListener('click', () => this.actualizarDatos());
        document.getElementById('btn-cancelar')?.addEventListener('click', () => this.ocultarModal());
        document.getElementById('btn-guardar')?.addEventListener('click', () => this.guardarEquipamiento());
        document.getElementById('btn-cerrar-detalles')?.addEventListener('click', () => this.ocultarModalDetalles());

        // Modales
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModal();
        });
        
        document.getElementById('modal-detalles')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModalDetalles();
        });
    }

    // Métodos públicos para ser llamados desde el HTML
    public cambiarPagina(pagina: number): void {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    public editarEquipamiento(id: string): void {
        const equipamiento = EquipamientoOperations.obtenerPorId(id);
        if (equipamiento) {
            this.idEditando = id;
            this.mostrarModal(equipamiento);
        }
    }

    public verDetalles(id: string): void {
        const equipamiento = EquipamientoOperations.obtenerPorId(id);
        if (equipamiento) {
            this.mostrarModalDetalles(equipamiento);
        }
    }

    public verVehiculos(id: string): void {
        // Aquí podrías implementar navegación a la página de automóviles filtrada por equipamiento
        console.log(`Ver vehículos con equipamiento: ${id}`);
        alert('Funcionalidad de ver vehículos - Redirigir a página de automóviles filtrada');
    }

    public async eliminarEquipamiento(id: string): Promise<void> {
        const exito = await EquipamientoOperations.eliminar(id);
        if (exito) {
            this.actualizarDatos();
        }
    }

    private mostrarModal(equipamiento?: Equipamiento): void {
        const modal = document.getElementById('modal');
        const titulo = document.getElementById('titulo-modal');
        
        if (equipamiento) {
            titulo!.textContent = 'Editar Equipamiento';
            this.llenarFormulario(equipamiento);
        } else {
            titulo!.textContent = 'Nuevo Equipamiento';
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

    private mostrarModalDetalles(equipamiento: Equipamiento): void {
        const modal = document.getElementById('modal-detalles');
        const contenido = document.getElementById('contenido-detalles');
        
        if (contenido) {
            const vehiculosConEquipamiento = this.obtenerVehiculosConEquipamiento(equipamiento.id);
            const extrasRelacionados = this.obtenerExtrasRelacionados(equipamiento.id);
            
            contenido.innerHTML = `
                <div class="space-y-6">
                    <!-- Información Básica -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Información Básica</h4>
                        <div class="grid grid-cols-1 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Nombre</label>
                                <p class="text-sm text-gray-900">${equipamiento.nombre}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Categoría</label>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.obtenerColorCategoria(equipamiento.categoria)} text-white">
                                    ${this.obtenerIconoCategoria(equipamiento.categoria)} ${equipamiento.categoria}
                                </span>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Descripción</label>
                                <p class="text-sm text-gray-900">${equipamiento.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Vehículos que incluyen este equipamiento -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Vehículos con este Equipamiento</h4>
                        ${vehiculosConEquipamiento.length > 0 ? `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${vehiculosConEquipamiento.map(auto => `
                                    <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                🚗
                                            </div>
                                            <div class="ml-3">
                                                <div class="text-sm font-medium text-blue-900">${auto.marca} ${auto.modelo}</div>
                                                <div class="text-xs text-blue-600">${auto.combustible} - ${Formatters.formatPrice(auto.precio)}</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500">Este equipamiento no está incluido en ningún vehículo</p>'}
                    </div>

                    <!-- Extras relacionados -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Extras Relacionados</h4>
                        ${extrasRelacionados.length > 0 ? `
                            <div class="space-y-2">
                                ${extrasRelacionados.map(extra => `
                                    <div class="bg-green-50 border border-green-200 rounded-md p-3">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <div class="text-sm font-medium text-green-900">${extra.nombre}</div>
                                                <div class="text-xs text-green-600">${extra.descripcion}</div>
                                            </div>
                                            <div class="text-sm font-medium text-green-800">
                                                ${Formatters.formatPrice(extra.precio)}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500">No hay extras relacionados con este equipamiento</p>'}
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

    private obtenerVehiculosConEquipamiento(equipamientoId: string): any[] {
        const automoviles = AutomovilOperations.listar();
        return automoviles.filter(auto => auto.equipamientoSerie.includes(equipamientoId));
    }

    private llenarFormulario(equipamiento: Equipamiento): void {
        (document.getElementById('nombre') as HTMLInputElement).value = equipamiento.nombre;
        (document.getElementById('descripcion') as HTMLTextAreaElement).value = equipamiento.descripcion;
        (document.getElementById('categoria') as HTMLSelectElement).value = equipamiento.categoria;
    }

    private limpiarFormulario(): void {
        const formulario = document.getElementById('formulario-equipamiento') as HTMLFormElement;
        formulario.reset();
    }

    private async guardarEquipamiento(): Promise<void> {
        const datosFormulario = this.obtenerDatosFormulario();
        if (!datosFormulario) return;

        let exito = false;
        if (this.idEditando) {
            exito = await EquipamientoOperations.modificar(this.idEditando, datosFormulario);
        } else {
            exito = await EquipamientoOperations.insertar(datosFormulario);
        }

        if (exito) {
            this.ocultarModal();
            this.actualizarDatos();
        }
    }

    private obtenerDatosFormulario(): any {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value.trim();
        const categoria = (document.getElementById('categoria') as HTMLSelectElement).value;

        if (!nombre || !descripcion || !categoria) {
            alert('Por favor, complete todos los campos obligatorios');
            return null;
        }

        return { nombre, descripcion, categoria };
    }

    private actualizarDatos(): void {
        this.cargarDatos();
        // Actualizar opciones de categorías en el filtro
        const filtro = document.getElementById('filtro-categoria') as HTMLSelectElement;
        if (filtro) {
            const valorActual = filtro.value;
            filtro.innerHTML = `<option value="">Todas las categorías</option>${this.obtenerOpcionesCategorias()}`;
            filtro.value = valorActual;
        }
    }

    // Método requerido por el dashboardManager
    render(container: HTMLElement): void {
        this.renderizar(container);
    }
}