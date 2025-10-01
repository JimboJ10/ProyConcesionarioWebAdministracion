import { ExtraOperations } from '../scripts/extraOperations';
import { EquipamientoOperations } from '../scripts/equipamientoOperations';
import { AutomovilOperations } from '../scripts/automovilOperations';
import { Extra } from '../Entidades/Extra';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class ExtraPage {
    private extras: Extra[] = [];
    private extrasFiltrados: Extra[] = [];
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
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Extras</h1>
                    <button id="btn-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>Nuevo Extra</span>
                    </button>
                </div>

                <!-- Búsqueda y Filtros -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        <div>
                            <select id="filtro-precio" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los precios</option>
                                <option value="0-500">$0 - $500</option>
                                <option value="500-1000">$500 - $1.000</option>
                                <option value="1000-2000">$1.000 - $2.000</option>
                                <option value="2000-5000">$2.000 - $5.000</option>
                                <option value="5000+">Más de $5.000</option>
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamiento Base</th>
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
                            <h3 id="titulo-modal" class="text-lg font-medium text-gray-900">Nuevo Extra</h3>
                        </div>
                        <form id="formulario-extra" class="px-6 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Información Básica -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Información Básica</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Extra *</label>
                                        <input type="text" id="nombre" required 
                                               placeholder="Ej: Techo Solar Panorámico"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                                        <textarea id="descripcion" required rows="3"
                                                  placeholder="Descripción detallada del extra y sus características..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span class="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input type="number" id="precio" required min="0" step="0.01"
                                                   placeholder="1500.00"
                                                   class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </div>
                                        <p class="text-xs text-gray-500 mt-1">Precio sin IVA</p>
                                    </div>
                                </div>

                                <!-- Categorización y Relaciones -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Categorización</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                        <select id="categoria" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar categoría</option>
                                            ${this.obtenerOpcionesCategoriasPredefinidas()}
                                        </select>
                                        <p class="text-xs text-gray-500 mt-1">Tipo de extra según su función principal</p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Equipamiento Base (Opcional)</label>
                                        <select id="equipamiento-id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Sin equipamiento base</option>
                                            ${this.obtenerOpcionesEquipamientos()}
                                        </select>
                                        <p class="text-xs text-gray-500 mt-1">Equipamiento sobre el que se basa este extra</p>
                                    </div>

                                    <!-- Información del equipamiento base -->
                                    <div id="info-equipamiento" class="hidden">
                                        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                                            <h5 class="text-sm font-medium text-blue-800 mb-2">Equipamiento Base</h5>
                                            <div id="detalles-equipamiento" class="text-xs text-blue-600">
                                                <!-- Se cargará dinámicamente -->
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Previsualización de precio -->
                                    <div class="bg-green-50 border border-green-200 rounded-md p-3">
                                        <h5 class="text-sm font-medium text-green-800 mb-2">💰 Previsualización de Precio</h5>
                                        <div class="text-xs text-green-600">
                                            <div>Precio sin IVA: <span id="precio-sin-iva">$0.00</span></div>
                                            <div>IVA (21%): <span id="precio-iva">$0.00</span></div>
                                            <div class="font-medium">Precio final: <span id="precio-final">$0.00</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Ejemplos por categoría -->
                            <div class="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                                <h4 class="text-sm font-medium text-gray-800 mb-2">💡 Ejemplos por Categoría</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-600">
                                    <div>
                                        <strong class="text-red-600">Seguridad:</strong>
                                        <br>• Airbags laterales
                                        <br>• Cámara trasera
                                        <br>• Sensores aparcamiento
                                    </div>
                                    <div>
                                        <strong class="text-blue-600">Confort:</strong>
                                        <br>• Asientos calefactados
                                        <br>• Climatizador automático
                                        <br>• Techo solar
                                    </div>
                                    <div>
                                        <strong class="text-purple-600">Tecnología:</strong>
                                        <br>• Sistema navegación premium
                                        <br>• Conectividad smartphone
                                        <br>• Sistema sonido premium
                                    </div>
                                    <div>
                                        <strong class="text-green-600">Estética:</strong>
                                        <br>• Llantas aleación
                                        <br>• Pintura metalizada
                                        <br>• Kit carrocería deportivo
                                    </div>
                                    <div>
                                        <strong class="text-orange-600">Rendimiento:</strong>
                                        <br>• Suspensión deportiva
                                        <br>• Escape deportivo
                                        <br>• Modo de conducción sport
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
                            <h3 class="text-lg font-medium text-gray-900">Detalles del Extra</h3>
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
        this.extras = ExtraOperations.listar();
        this.aplicarFiltros();
    }

    private aplicarFiltros(): void {
        let extrasFiltrados = ExtraOperations.buscar(this.terminoBusqueda);
        
        // Aplicar filtro de categoría
        const categoriaSeleccionada = (document.getElementById('filtro-categoria') as HTMLSelectElement)?.value;
        if (categoriaSeleccionada) {
            extrasFiltrados = extrasFiltrados.filter(extra => extra.categoria === categoriaSeleccionada);
        }

        // Aplicar filtro de precio
        const precioSeleccionado = (document.getElementById('filtro-precio') as HTMLSelectElement)?.value;
        if (precioSeleccionado) {
            extrasFiltrados = this.filtrarPorRangoPrecio(extrasFiltrados, precioSeleccionado);
        }
        
        this.extrasFiltrados = extrasFiltrados;
        this.paginaActual = 1;
        this.renderizarTabla();
    }

    private filtrarPorRangoPrecio(extras: Extra[], rango: string): Extra[] {
        switch (rango) {
            case '0-500':
                return extras.filter(extra => extra.precio >= 0 && extra.precio <= 500);
            case '500-1000':
                return extras.filter(extra => extra.precio > 500 && extra.precio <= 1000);
            case '1000-2000':
                return extras.filter(extra => extra.precio > 1000 && extra.precio <= 2000);
            case '2000-5000':
                return extras.filter(extra => extra.precio > 2000 && extra.precio <= 5000);
            case '5000+':
                return extras.filter(extra => extra.precio > 5000);
            default:
                return extras;
        }
    }

    private obtenerOpcionesCategorias(): string {
        const categorias = ExtraOperations.obtenerCategorias();
        return categorias.map(categoria => 
            `<option value="${categoria}">${categoria}</option>`
        ).join('');
    }

    private obtenerOpcionesCategoriasPredefinidas(): string {
        const categoriasPredefinidas = ['Seguridad', 'Confort', 'Tecnología', 'Estética', 'Rendimiento'];
        return categoriasPredefinidas.map(categoria => 
            `<option value="${categoria}">${categoria}</option>`
        ).join('');
    }

    private obtenerOpcionesEquipamientos(): string {
        const equipamientos = EquipamientoOperations.listar();
        return equipamientos.map(equipamiento => 
            `<option value="${equipamiento.id}">${equipamiento.nombre} (${equipamiento.categoria})</option>`
        ).join('');
    }

    private crearTarjetasEstadisticas(): string {
        const totalExtras = this.extras.length;
        const categoriasActivas = new Set(this.extras.map(e => e.categoria)).size;
        const extrasEnVehiculos = this.contarExtrasEnVehiculos();
        const promedioPrecios = this.calcularPromedioPrecios();

        const estadisticas = [
            {
                titulo: 'Total Extras',
                valor: totalExtras.toString(),
                icono: '✨',
                color: 'bg-blue-500'
            },
            {
                titulo: 'Categorías',
                valor: categoriasActivas.toString(),
                icono: '📂',
                color: 'bg-green-500'
            },
            {
                titulo: 'En Vehículos',
                valor: extrasEnVehiculos.toString(),
                icono: '🚗',
                color: 'bg-purple-500'
            },
            {
                titulo: 'Precio Promedio',
                valor: Formatters.formatPrice(promedioPrecios),
                icono: '💰',
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

    private contarExtrasEnVehiculos(): number {
        const automoviles = AutomovilOperations.listar();
        const extrasEnUso = new Set<string>();
        
        automoviles.forEach(auto => {
            auto.extrasDisponibles.forEach(extraId => {
                extrasEnUso.add(extraId);
            });
        });
        
        return extrasEnUso.size;
    }

    private calcularPromedioPrecios(): number {
        if (this.extras.length === 0) return 0;
        const suma = this.extras.reduce((total, extra) => total + extra.precio, 0);
        return suma / this.extras.length;
    }

    private renderizarTabla(): void {
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        if (!cuerpoTabla) return;

        const indiceInicio = (this.paginaActual - 1) * this.tamañoPagina;
        const indiceFin = indiceInicio + this.tamañoPagina;
        const datosPaginados = this.extrasFiltrados.slice(indiceInicio, indiceFin);

        if (datosPaginados.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        ${this.terminoBusqueda ? 'No se encontraron resultados' : 'No hay extras registrados'}
                    </td>
                </tr>
            `;
        } else {
            cuerpoTabla.innerHTML = datosPaginados.map(extra => {
                const equipamientoBase = extra.equipamientoId ? 
                    EquipamientoOperations.obtenerPorId(extra.equipamientoId) : null;
                const vehiculosConExtra = this.contarVehiculosConExtra(extra.id);
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div class="h-10 w-10 rounded-full ${this.obtenerColorCategoria(extra.categoria)} flex items-center justify-center text-white font-semibold">
                                        ${this.obtenerIconoCategoria(extra.categoria)}
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${extra.nombre}</div>
                                    <div class="text-sm text-gray-500">${this.truncarTexto(extra.descripcion, 60)}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.obtenerColorCategoria(extra.categoria)} text-white">
                                ${extra.categoria}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${Formatters.formatPrice(extra.precio)}</div>
                            <div class="text-xs text-gray-500">Sin IVA</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${equipamientoBase ? `
                                <div class="flex items-center">
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        ${equipamientoBase.nombre}
                                    </span>
                                </div>
                            ` : '<span class="text-gray-400">Sin equipamiento base</span>'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div class="flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ${vehiculosConExtra} vehículos
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button onclick="extraPage.verDetalles('${extra.id}')" 
                                        class="text-purple-600 hover:text-purple-900" title="Ver detalles">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                <button onclick="extraPage.editarExtra('${extra.id}')" 
                                        class="text-blue-600 hover:text-blue-900" title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="extraPage.verVehiculos('${extra.id}')" 
                                        class="text-green-600 hover:text-green-900" title="Ver vehículos">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </button>
                                <button onclick="extraPage.eliminarExtra('${extra.id}')" 
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
                return '⭐';
        }
    }

    private contarVehiculosConExtra(extraId: string): number {
        const automoviles = AutomovilOperations.listar();
        return automoviles.filter(auto => auto.extrasDisponibles.includes(extraId)).length;
    }

    private truncarTexto(texto: string, maxLength: number): string {
        return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
    }

    private renderizarPaginacion(): void {
        const paginacion = document.getElementById('paginacion');
        if (!paginacion) return;

        const totalPaginas = Utils.getTotalPages(this.extrasFiltrados.length, this.tamañoPagina);
        const elementoInicio = (this.paginaActual - 1) * this.tamañoPagina + 1;
        const elementoFin = Math.min(this.paginaActual * this.tamañoPagina, this.extrasFiltrados.length);

        paginacion.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                        onclick="extraPage.cambiarPagina(${this.paginaActual - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                        onclick="extraPage.cambiarPagina(${this.paginaActual + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${elementoInicio}</span> a <span class="font-medium">${elementoFin}</span> de{' '}
                        <span class="font-medium">${this.extrasFiltrados.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                                onclick="extraPage.cambiarPagina(${this.paginaActual - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generarNumerosPagina(totalPaginas)}
                        <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                                onclick="extraPage.cambiarPagina(${this.paginaActual + 1})"
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
                <button onclick="extraPage.cambiarPagina(${i})"
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
        (window as any).extraPage = this;

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
        const filtroCategoria = document.getElementById('filtro-categoria') as HTMLSelectElement;
        const filtroPrecio = document.getElementById('filtro-precio') as HTMLSelectElement;
        
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        }
        
        if (filtroPrecio) {
            filtroPrecio.addEventListener('change', () => this.aplicarFiltros());
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

        // Cambio de equipamiento base en formulario
        const equipamientoSelect = document.getElementById('equipamiento-id') as HTMLSelectElement;
        if (equipamientoSelect) {
            equipamientoSelect.addEventListener('change', (e) => {
                this.mostrarInfoEquipamiento((e.target as HTMLSelectElement).value);
            });
        }

        // Cambio de precio para previsualización
        const precioInput = document.getElementById('precio') as HTMLInputElement;
        if (precioInput) {
            precioInput.addEventListener('input', (e) => {
                this.actualizarPrevisualizacionPrecio(parseFloat((e.target as HTMLInputElement).value) || 0);
            });
        }

        // Botones principales
        document.getElementById('btn-nuevo')?.addEventListener('click', () => this.mostrarModal());
        document.getElementById('btn-actualizar')?.addEventListener('click', () => this.actualizarDatos());
        document.getElementById('btn-cancelar')?.addEventListener('click', () => this.ocultarModal());
        document.getElementById('btn-guardar')?.addEventListener('click', () => this.guardarExtra());
        document.getElementById('btn-cerrar-detalles')?.addEventListener('click', () => this.ocultarModalDetalles());

        // Modales
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModal();
        });
        
        document.getElementById('modal-detalles')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModalDetalles();
        });
    }

    private mostrarInfoEquipamiento(equipamientoId: string): void {
        const infoContainer = document.getElementById('info-equipamiento');
        const detallesContainer = document.getElementById('detalles-equipamiento');
        
        if (!equipamientoId) {
            infoContainer?.classList.add('hidden');
            return;
        }

        const equipamiento = EquipamientoOperations.obtenerPorId(equipamientoId);
        if (equipamiento && detallesContainer) {
            detallesContainer.innerHTML = `
                <div><strong>Nombre:</strong> ${equipamiento.nombre}</div>
                <div><strong>Categoría:</strong> ${equipamiento.categoria}</div>
                <div><strong>Descripción:</strong> ${equipamiento.descripcion}</div>
            `;
            infoContainer?.classList.remove('hidden');
        }
    }

    private actualizarPrevisualizacionPrecio(precio: number): void {
        const iva = precio * 0.21;
        const precioFinal = precio + iva;

        const precioSinIvaElement = document.getElementById('precio-sin-iva');
        const precioIvaElement = document.getElementById('precio-iva');
        const precioFinalElement = document.getElementById('precio-final');

        if (precioSinIvaElement) precioSinIvaElement.textContent = Formatters.formatPrice(precio);
        if (precioIvaElement) precioIvaElement.textContent = Formatters.formatPrice(iva);
        if (precioFinalElement) precioFinalElement.textContent = Formatters.formatPrice(precioFinal);
    }

    // Métodos públicos para ser llamados desde el HTML
    public cambiarPagina(pagina: number): void {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    public editarExtra(id: string): void {
        const extra = ExtraOperations.obtenerPorId(id);
        if (extra) {
            this.idEditando = id;
            this.mostrarModal(extra);
        }
    }

    public verDetalles(id: string): void {
        const extra = ExtraOperations.obtenerPorId(id);
        if (extra) {
            this.mostrarModalDetalles(extra);
        }
    }

    public verVehiculos(id: string): void {
        // Aquí podrías implementar navegación a la página de automóviles filtrada por extra
        console.log(`Ver vehículos con extra: ${id}`);
        alert('Funcionalidad de ver vehículos - Redirigir a página de automóviles filtrada');
    }

    public async eliminarExtra(id: string): Promise<void> {
        const exito = await ExtraOperations.eliminar(id);
        if (exito) {
            this.actualizarDatos();
        }
    }

    private mostrarModal(extra?: Extra): void {
        const modal = document.getElementById('modal');
        const titulo = document.getElementById('titulo-modal');
        
        if (extra) {
            titulo!.textContent = 'Editar Extra';
            this.llenarFormulario(extra);
        } else {
            titulo!.textContent = 'Nuevo Extra';
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

    private mostrarModalDetalles(extra: Extra): void {
        const modal = document.getElementById('modal-detalles');
        const contenido = document.getElementById('contenido-detalles');
        
        if (contenido) {
            const equipamientoBase = extra.equipamientoId ? 
                EquipamientoOperations.obtenerPorId(extra.equipamientoId) : null;
            const vehiculosConExtra = this.obtenerVehiculosConExtra(extra.id);
            
            contenido.innerHTML = `
                <div class="space-y-6">
                    <!-- Información Básica -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Información Básica</h4>
                        <div class="grid grid-cols-1 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Nombre</label>
                                <p class="text-sm text-gray-900">${extra.nombre}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Categoría</label>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.obtenerColorCategoria(extra.categoria)} text-white">
                                    ${this.obtenerIconoCategoria(extra.categoria)} ${extra.categoria}
                                </span>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Descripción</label>
                                <p class="text-sm text-gray-900">${extra.descripcion}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-600">Precio sin IVA</label>
                                    <p class="text-sm font-medium text-gray-900">${Formatters.formatPrice(extra.precio)}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-600">Precio con IVA (21%)</label>
                                    <p class="text-sm font-medium text-green-600">${Formatters.formatPrice(extra.precio * 1.21)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Equipamiento Base -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Equipamiento Base</h4>
                        ${equipamientoBase ? `
                            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div class="grid grid-cols-1 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Nombre</label>
                                        <p class="text-sm text-blue-900">${equipamientoBase.nombre}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Categoría</label>
                                        <p class="text-sm text-blue-900">${equipamientoBase.categoria}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-blue-600">Descripción</label>
                                        <p class="text-sm text-blue-900">${equipamientoBase.descripcion}</p>
                                    </div>
                                </div>
                            </div>
                        ` : '<p class="text-gray-500">Este extra no está basado en ningún equipamiento específico</p>'}
                    </div>

                    <!-- Vehículos que incluyen este extra -->
                    <div>
                        <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Vehículos que incluyen este Extra</h4>
                        ${vehiculosConExtra.length > 0 ? `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${vehiculosConExtra.map(auto => `
                                    <div class="bg-green-50 border border-green-200 rounded-md p-3">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                🚗
                                            </div>
                                            <div class="ml-3">
                                                <div class="text-sm font-medium text-green-900">${auto.marca} ${auto.modelo}</div>
                                                <div class="text-xs text-green-600">${auto.combustible} - ${Formatters.formatPrice(auto.precio)}</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500">Este extra no está disponible en ningún vehículo</p>'}
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

    private obtenerVehiculosConExtra(extraId: string): any[] {
        const automoviles = AutomovilOperations.listar();
        return automoviles.filter(auto => auto.extrasDisponibles.includes(extraId));
    }

    private llenarFormulario(extra: Extra): void {
        (document.getElementById('nombre') as HTMLInputElement).value = extra.nombre;
        (document.getElementById('descripcion') as HTMLTextAreaElement).value = extra.descripcion;
        (document.getElementById('precio') as HTMLInputElement).value = extra.precio.toString();
        (document.getElementById('categoria') as HTMLSelectElement).value = extra.categoria;
        
        if (extra.equipamientoId) {
            (document.getElementById('equipamiento-id') as HTMLSelectElement).value = extra.equipamientoId;
            this.mostrarInfoEquipamiento(extra.equipamientoId);
        }

        // Actualizar previsualización de precio
        this.actualizarPrevisualizacionPrecio(extra.precio);
    }

    private limpiarFormulario(): void {
        const formulario = document.getElementById('formulario-extra') as HTMLFormElement;
        formulario.reset();
        
        // Ocultar información del equipamiento
        document.getElementById('info-equipamiento')?.classList.add('hidden');
        
        // Resetear previsualización de precio
        this.actualizarPrevisualizacionPrecio(0);
    }

    private async guardarExtra(): Promise<void> {
        const datosFormulario = this.obtenerDatosFormulario();
        if (!datosFormulario) return;

        let exito = false;
        if (this.idEditando) {
            exito = await ExtraOperations.modificar(this.idEditando, datosFormulario);
        } else {
            exito = await ExtraOperations.insertar(datosFormulario);
        }

        if (exito) {
            this.ocultarModal();
            this.actualizarDatos();
        }
    }

    private obtenerDatosFormulario(): any {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value.trim();
        const precio = parseFloat((document.getElementById('precio') as HTMLInputElement).value) || 0;
        const categoria = (document.getElementById('categoria') as HTMLSelectElement).value;
        const equipamientoId = (document.getElementById('equipamiento-id') as HTMLSelectElement).value || undefined;

        if (!nombre || !descripcion || !categoria || precio <= 0) {
            alert('Por favor, complete todos los campos obligatorios con valores válidos');
            return null;
        }

        return { nombre, descripcion, precio, categoria, equipamientoId };
    }

    private actualizarDatos(): void {
        this.cargarDatos();
        // Actualizar las opciones de categorías y equipamientos en los selects
        const filtroCategoria = document.getElementById('filtro-categoria') as HTMLSelectElement;
        const equipamientoSelect = document.getElementById('equipamiento-id') as HTMLSelectElement;
        
        if (filtroCategoria) {
            const valorActual = filtroCategoria.value;
            filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>${this.obtenerOpcionesCategorias()}`;
            filtroCategoria.value = valorActual;
        }
        
        if (equipamientoSelect) {
            const valorActual = equipamientoSelect.value;
            equipamientoSelect.innerHTML = `<option value="">Sin equipamiento base</option>${this.obtenerOpcionesEquipamientos()}`;
            equipamientoSelect.value = valorActual;
        }
    }

    // Método requerido por el dashboardManager
    render(container: HTMLElement): void {
        this.renderizar(container);
    }
}