import { AutomovilOperations } from '../scripts/automovilOperations';
import { EquipamientoOperations } from '../scripts/equipamientoOperations';
import { ExtraOperations } from '../scripts/extraOperations';
import { Automovil } from '../Entidades/Automovil';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class AutomovilPage {
    private automoviles: Automovil[] = [];
    private automovilesEtiltrados: Automovil[] = [];
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
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Automóviles</h1>
                    <button id="btn-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>Nuevo Automóvil</span>
                    </button>
                </div>

                <!-- Búsqueda y Filtros -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <input type="text" id="entrada-busqueda" placeholder="Buscar por marca, modelo, combustible..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <select id="filtro-marca" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las marcas</option>
                                ${CONSTANTS.CAR_BRANDS.map(marca => 
                                    `<option value="${marca}">${marca}</option>`
                                ).join('')}
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

                <!-- Tabla -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especificaciones</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motor</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamiento</th>
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
                    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 id="titulo-modal" class="text-lg font-medium text-gray-900">Nuevo Automóvil</h3>
                        </div>
                        <form id="formulario-automovil" class="px-6 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Información Básica -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Información Básica</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                                        <select id="marca" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar marca</option>
                                            ${CONSTANTS.CAR_BRANDS.map(marca => 
                                                `<option value="${marca}">${marca}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                                        <input type="text" id="modelo" required 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
                                        <input type="number" id="precio" required min="1000" max="500000" step="1"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                                        <input type="number" id="descuento" min="0" max="100" step="1" value="0"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>

                                <!-- Especificaciones Técnicas -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2">Especificaciones Técnicas</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Potencia Fiscal (CV) *</label>
                                        <input type="number" id="potencia-fiscal" required min="50" max="1000" step="1"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Cilindrada (cc) *</label>
                                        <input type="number" id="cilindrada" required min="800" max="8000" step="1"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Combustible *</label>
                                        <select id="combustible" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar combustible</option>
                                            ${CONSTANTS.FUEL_TYPES.map(tipo => 
                                                `<option value="${tipo}">${tipo}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Transmisión *</label>
                                        <select id="transmision" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar transmisión</option>
                                            ${CONSTANTS.TRANSMISSION_TYPES.map(tipo => 
                                                `<option value="${tipo}">${tipo}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Equipamiento y Extras -->
                            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Equipamiento de Serie -->
                                <div>
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Equipamiento de Serie</h4>
                                    <div id="contenedor-equipamiento" class="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                                        <!-- Se cargará dinámicamente -->
                                    </div>
                                </div>

                                <!-- Extras Disponibles -->
                                <div>
                                    <h4 class="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Extras Disponibles</h4>
                                    <div id="contenedor-extras" class="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                                        <!-- Se cargará dinámicamente -->
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
            </div>
        `;

        this.configurarEventListeners();
        this.renderizarTabla();
        this.cargarEquipamientoYExtras();
    }

    private cargarDatos(): void {
        this.automoviles = AutomovilOperations.listar();
        this.aplicarFiltros();
    }

    private aplicarFiltros(): void {
        let automovilesEtiltrados = AutomovilOperations.buscar(this.terminoBusqueda);
        
        // Aplicar filtro de marca
        const marcaSeleccionada = (document.getElementById('filtro-marca') as HTMLSelectElement)?.value;
        if (marcaSeleccionada) {
            automovilesEtiltrados = automovilesEtiltrados.filter(auto => auto.marca === marcaSeleccionada);
        }
        
        this.automovilesEtiltrados = automovilesEtiltrados;
        this.paginaActual = 1;
        this.renderizarTabla();
    }

    private renderizarTabla(): void {
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        if (!cuerpoTabla) return;

        const indiceInicio = (this.paginaActual - 1) * this.tamañoPagina;
        const indiceFin = indiceInicio + this.tamañoPagina;
        const datosPaginados = this.automovilesEtiltrados.slice(indiceInicio, indiceFin);

        if (datosPaginados.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        ${this.terminoBusqueda ? 'No se encontraron resultados' : 'No hay automóviles registrados'}
                    </td>
                </tr>
            `;
        } else {
            cuerpoTabla.innerHTML = datosPaginados.map(automovil => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${automovil.marca}</div>
                        <div class="text-sm text-gray-500">${automovil.modelo}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${Formatters.formatPrice(automovil.precio)}</div>
                        ${automovil.descuento > 0 ? `
                            <div class="text-sm text-green-600">
                                -${automovil.descuento}% (${Formatters.formatPrice(automovil.getPrecioConDescuento())})
                            </div>
                        ` : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div>${automovil.combustible}</div>
                        <div>${automovil.transmision}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div>${automovil.potenciaFiscal} CV</div>
                        <div>${automovil.cilindrada} cc</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div class="flex flex-col gap-1">
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                ${automovil.equipamientoSerie.length} de serie
                            </span>
                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                ${automovil.extrasDisponibles.length} extras
                            </span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="automovilPage.editarAutomovil('${automovil.id}')" 
                                    class="text-blue-600 hover:text-blue-900">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="automovilPage.eliminarAutomovil('${automovil.id}')" 
                                    class="text-red-600 hover:text-red-900">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        this.renderizarPaginacion();
    }

    private renderizarPaginacion(): void {
        const paginacion = document.getElementById('paginacion');
        if (!paginacion) return;

        const totalPaginas = Utils.getTotalPages(this.automovilesEtiltrados.length, this.tamañoPagina);
        const elementoInicio = (this.paginaActual - 1) * this.tamañoPagina + 1;
        const elementoFin = Math.min(this.paginaActual * this.tamañoPagina, this.automovilesEtiltrados.length);

        paginacion.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                        onclick="automovilPage.cambiarPagina(${this.paginaActual - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                        onclick="automovilPage.cambiarPagina(${this.paginaActual + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${elementoInicio}</span> a <span class="font-medium">${elementoFin}</span> de{' '}
                        <span class="font-medium">${this.automovilesEtiltrados.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.paginaActual <= 1 ? 'disabled' : ''} 
                                onclick="automovilPage.cambiarPagina(${this.paginaActual - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generarNumerosPagina(totalPaginas)}
                        <button ${this.paginaActual >= totalPaginas ? 'disabled' : ''} 
                                onclick="automovilPage.cambiarPagina(${this.paginaActual + 1})"
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
                <button onclick="automovilPage.cambiarPagina(${i})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                            i === this.paginaActual ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : ''
                        }">
                    ${i}
                </button>
            `);
        }
        return paginas.join('');
    }

    private cargarEquipamientoYExtras(): void {
        const contenedorEquipamiento = document.getElementById('contenedor-equipamiento');
        const contenedorExtras = document.getElementById('contenedor-extras');
        
        if (contenedorEquipamiento) {
            const equipamientos = EquipamientoOperations.listar();
            contenedorEquipamiento.innerHTML = equipamientos.map(equipamiento => `
                <label class="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" value="${equipamiento.id}" class="checkbox-equipamiento mr-3">
                    <div>
                        <div class="text-sm font-medium">${equipamiento.nombre}</div>
                        <div class="text-xs text-gray-500">${equipamiento.descripcion}</div>
                        <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${equipamiento.categoria}</span>
                    </div>
                </label>
            `).join('');
        }

        if (contenedorExtras) {
            const extras = ExtraOperations.listar();
            contenedorExtras.innerHTML = extras.map(extra => `
                <label class="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" value="${extra.id}" class="checkbox-extra mr-3">
                    <div>
                        <div class="text-sm font-medium">${extra.nombre}</div>
                        <div class="text-xs text-gray-500">${extra.descripcion}</div>
                        <div class="flex gap-2 mt-1">
                            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${extra.categoria}</span>
                            <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">${Formatters.formatPrice(extra.precio)}</span>
                        </div>
                    </div>
                </label>
            `).join('');
        }
    }

    private configurarEventListeners(): void {
        // Hacer la instancia disponible globalmente
        (window as any).automovilPage = this;

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

        // Filtro de marca
        const filtroMarca = document.getElementById('filtro-marca') as HTMLSelectElement;
        if (filtroMarca) {
            filtroMarca.addEventListener('change', () => {
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

        // Botones
        document.getElementById('btn-nuevo')?.addEventListener('click', () => this.mostrarModal());
        document.getElementById('btn-actualizar')?.addEventListener('click', () => this.actualizarDatos());
        document.getElementById('btn-cancelar')?.addEventListener('click', () => this.ocultarModal());
        document.getElementById('btn-guardar')?.addEventListener('click', () => this.guardarAutomovil());

        // Modal
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.ocultarModal();
        });
    }

    // Métodos públicos para ser llamados desde el HTML
    public cambiarPagina(pagina: number): void {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    public editarAutomovil(id: string): void {
        const automovil = AutomovilOperations.obtenerPorId(id);
        if (automovil) {
            this.idEditando = id;
            this.mostrarModal(automovil);
        }
    }

    public async eliminarAutomovil(id: string): Promise<void> {
        const exito = await AutomovilOperations.eliminar(id);
        if (exito) {
            this.actualizarDatos();
        }
    }

    private mostrarModal(automovil?: Automovil): void {
        const modal = document.getElementById('modal');
        const titulo = document.getElementById('titulo-modal');
        
        if (automovil) {
            titulo!.textContent = 'Editar Automóvil';
            this.llenarFormulario(automovil);
        } else {
            titulo!.textContent = 'Nuevo Automóvil';
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

    private llenarFormulario(automovil: Automovil): void {
        (document.getElementById('marca') as HTMLSelectElement).value = automovil.marca;
        (document.getElementById('modelo') as HTMLInputElement).value = automovil.modelo;
        (document.getElementById('precio') as HTMLInputElement).value = automovil.precio.toString();
        (document.getElementById('descuento') as HTMLInputElement).value = automovil.descuento.toString();
        (document.getElementById('potencia-fiscal') as HTMLInputElement).value = automovil.potenciaFiscal.toString();
        (document.getElementById('cilindrada') as HTMLInputElement).value = automovil.cilindrada.toString();
        (document.getElementById('combustible') as HTMLSelectElement).value = automovil.combustible;
        (document.getElementById('transmision') as HTMLSelectElement).value = automovil.transmision;
        
        // Equipamiento de serie
        document.querySelectorAll('.checkbox-equipamiento').forEach(checkbox => {
            const cb = checkbox as HTMLInputElement;
            cb.checked = automovil.equipamientoSerie.includes(cb.value);
        });

        // Extras disponibles
        document.querySelectorAll('.checkbox-extra').forEach(checkbox => {
            const cb = checkbox as HTMLInputElement;
            cb.checked = automovil.extrasDisponibles.includes(cb.value);
        });
    }

    private limpiarFormulario(): void {
        const formulario = document.getElementById('formulario-automovil') as HTMLFormElement;
        formulario.reset();
        
        document.querySelectorAll('.checkbox-equipamiento, .checkbox-extra').forEach(checkbox => {
            (checkbox as HTMLInputElement).checked = false;
        });
    }

    private async guardarAutomovil(): Promise<void> {
        const datosFormulario = this.obtenerDatosFormulario();
        if (!datosFormulario) return;

        let exito = false;
        if (this.idEditando) {
            exito = await AutomovilOperations.modificar(this.idEditando, datosFormulario);
        } else {
            exito = await AutomovilOperations.insertar(datosFormulario);
        }

        if (exito) {
            this.ocultarModal();
            this.actualizarDatos();
        }
    }

    private obtenerDatosFormulario(): any {
        const marca = (document.getElementById('marca') as HTMLSelectElement).value;
        const modelo = (document.getElementById('modelo') as HTMLInputElement).value.trim();
        const precio = parseFloat((document.getElementById('precio') as HTMLInputElement).value);
        const descuento = parseFloat((document.getElementById('descuento') as HTMLInputElement).value) || 0;
        const potenciaFiscal = parseInt((document.getElementById('potencia-fiscal') as HTMLInputElement).value);
        const cilindrada = parseInt((document.getElementById('cilindrada') as HTMLInputElement).value);
        const combustible = (document.getElementById('combustible') as HTMLSelectElement).value;
        const transmision = (document.getElementById('transmision') as HTMLSelectElement).value;
        
        const equipamientoSerie: string[] = [];
        document.querySelectorAll('.checkbox-equipamiento:checked').forEach(checkbox => {
            equipamientoSerie.push((checkbox as HTMLInputElement).value);
        });

        const extrasDisponibles: string[] = [];
        document.querySelectorAll('.checkbox-extra:checked').forEach(checkbox => {
            extrasDisponibles.push((checkbox as HTMLInputElement).value);
        });

        if (!marca || !modelo || !combustible || !transmision) {
            alert('Por favor, complete todos los campos obligatorios');
            return null;
        }

        return {
            marca, modelo, precio, descuento, potenciaFiscal, cilindrada,
            combustible, transmision, equipamientoSerie, extrasDisponibles
        };
    }

    private actualizarDatos(): void {
        this.cargarDatos();
    }

    // Método requerido por el dashboardManager
    render(container: HTMLElement): void {
        this.renderizar(container);
    }
}