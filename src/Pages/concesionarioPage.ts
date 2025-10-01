import { ConcesionarioOperations } from '../scripts/concesionarioOperations';
import { Concesionario } from '../Entidades/Concesionario';
import { Formatters } from '../scripts/formatters';
import { CONSTANTS } from '../scripts/constants';
import { Utils } from '../scripts/utils';

export class ConcesionarioPage {
    private concesionarios: Concesionario[] = [];
    private filteredConcesionarios: Concesionario[] = [];
    private currentPage: number = 1;
    private pageSize: number = CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE;
    private searchTerm: string = '';
    private editingId: string | null = null;

    render(container: HTMLElement): void {
        this.loadData();
        
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Concesionarios</h1>
                    <button id="btn-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>Nuevo Concesionario</span>
                    </button>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex-1">
                            <input type="text" id="search-input" placeholder="Buscar por nombre, NIF, dirección o email..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="flex gap-2">
                            <select id="page-size" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${CONSTANTS.PAGINATION.PAGE_SIZE_OPTIONS.map(size => 
                                    `<option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size} por página</option>`
                                ).join('')}
                            </select>
                            <button id="btn-refresh" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIF</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marcas</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Los datos se cargarán aquí -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="pagination" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <!-- La paginación se cargará aquí -->
                    </div>
                </div>

                <!-- Modal Form -->
                <div id="modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 id="modal-title" class="text-lg font-medium text-gray-900">Nuevo Concesionario</h3>
                        </div>
                        <form id="concesionario-form" class="px-6 py-4 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input type="text" id="nombre" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">NIF/CIF *</label>
                                <input type="text" id="nif" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                                <textarea id="direccion" required rows="2"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                <input type="tel" id="telefono" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" id="email" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Marcas</label>
                                <div id="marcas-container" class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    ${CONSTANTS.CAR_BRANDS.map(marca => `
                                        <label class="flex items-center">
                                            <input type="checkbox" value="${marca}" class="marca-checkbox mr-2">
                                            <span class="text-sm">${marca}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </form>
                        
                        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                            <button id="btn-cancel" class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">
                                Cancelar
                            </button>
                            <button id="btn-save" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.renderTable();
    }

    private loadData(): void {
        this.concesionarios = ConcesionarioOperations.listar();
        this.applyFilters();
    }

    private applyFilters(): void {
        this.filteredConcesionarios = ConcesionarioOperations.buscar(this.searchTerm);
        this.currentPage = 1;
        this.renderTable();
    }

    private renderTable(): void {
        const tableBody = document.getElementById('table-body');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginatedData = this.filteredConcesionarios.slice(startIndex, endIndex);

        if (paginatedData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        ${this.searchTerm ? 'No se encontraron resultados' : 'No hay concesionarios registrados'}
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = paginatedData.map(concesionario => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${concesionario.nombre}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Formatters.formatNIF(concesionario.nif)}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        ${concesionario.direccion}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>${Formatters.formatPhone(concesionario.telefono)}</div>
                        <div class="text-blue-600">${concesionario.email}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div class="flex flex-wrap gap-1">
                            ${concesionario.marcas.map(marca => 
                                `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${marca}</span>`
                            ).join('')}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="concesionarioPage.editConcesionario('${concesionario.id}')" 
                                    class="text-blue-600 hover:text-blue-900">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="concesionarioPage.deleteConcesionario('${concesionario.id}')" 
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

        this.renderPagination();
    }

    private renderPagination(): void {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Utils.getTotalPages(this.filteredConcesionarios.length, this.pageSize);
        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.filteredConcesionarios.length);

        pagination.innerHTML = `
            <div class="flex-1 flex justify-between sm:hidden">
                <button ${this.currentPage <= 1 ? 'disabled' : ''} 
                        onclick="concesionarioPage.changePage(${this.currentPage - 1})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>
                <button ${this.currentPage >= totalPages ? 'disabled' : ''} 
                        onclick="concesionarioPage.changePage(${this.currentPage + 1})"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Mostrando <span class="font-medium">${startItem}</span> a <span class="font-medium">${endItem}</span> de{' '}
                        <span class="font-medium">${this.filteredConcesionarios.length}</span> resultados
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button ${this.currentPage <= 1 ? 'disabled' : ''} 
                                onclick="concesionarioPage.changePage(${this.currentPage - 1})"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ${this.generatePageNumbers(totalPages)}
                        <button ${this.currentPage >= totalPages ? 'disabled' : ''} 
                                onclick="concesionarioPage.changePage(${this.currentPage + 1})"
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

    private generatePageNumbers(totalPages: number): string {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(`
                <button onclick="concesionarioPage.changePage(${i})"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                            i === this.currentPage ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : ''
                        }">
                    ${i}
                </button>
            `);
        }
        return pages.join('');
    }

    private setupEventListeners(): void {
        // Hacer la instancia disponible globalmente
        (window as any).concesionarioPage = this;

        // Búsqueda
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
            const debouncedSearch = Utils.debounce((term: string) => {
                this.searchTerm = term;
                this.applyFilters();
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch((e.target as HTMLInputElement).value);
            });
        }

        // Tamaño de página
        const pageSizeSelect = document.getElementById('page-size') as HTMLSelectElement;
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt((e.target as HTMLSelectElement).value);
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // Botones
        document.getElementById('btn-nuevo')?.addEventListener('click', () => this.showModal());
        document.getElementById('btn-refresh')?.addEventListener('click', () => this.refreshData());
        document.getElementById('btn-cancel')?.addEventListener('click', () => this.hideModal());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveConcesionario());

        // Modal
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideModal();
        });
    }

    // Métodos públicos para ser llamados desde el HTML
    public changePage(page: number): void {
        this.currentPage = page;
        this.renderTable();
    }

    public editConcesionario(id: string): void {
        const concesionario = ConcesionarioOperations.obtenerPorId(id);
        if (concesionario) {
            this.editingId = id;
            this.showModal(concesionario);
        }
    }

    public async deleteConcesionario(id: string): Promise<void> {
        const success = await ConcesionarioOperations.eliminar(id);
        if (success) {
            this.refreshData();
        }
    }

    private showModal(concesionario?: Concesionario): void {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        
        if (concesionario) {
            title!.textContent = 'Editar Concesionario';
            this.fillForm(concesionario);
        } else {
            title!.textContent = 'Nuevo Concesionario';
            this.clearForm();
        }
        
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    }

    private hideModal(): void {
        const modal = document.getElementById('modal');
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
        this.editingId = null;
        this.clearForm();
    }

    private fillForm(concesionario: Concesionario): void {
        (document.getElementById('nombre') as HTMLInputElement).value = concesionario.nombre;
        (document.getElementById('nif') as HTMLInputElement).value = concesionario.nif;
        (document.getElementById('direccion') as HTMLTextAreaElement).value = concesionario.direccion;
        (document.getElementById('telefono') as HTMLInputElement).value = concesionario.telefono;
        (document.getElementById('email') as HTMLInputElement).value = concesionario.email;
        
        // Marcas
        document.querySelectorAll('.marca-checkbox').forEach(checkbox => {
            const cb = checkbox as HTMLInputElement;
            cb.checked = concesionario.marcas.includes(cb.value);
        });
    }

    private clearForm(): void {
        const form = document.getElementById('concesionario-form') as HTMLFormElement;
        form.reset();
        
        document.querySelectorAll('.marca-checkbox').forEach(checkbox => {
            (checkbox as HTMLInputElement).checked = false;
        });
    }

    private async saveConcesionario(): Promise<void> {
        const formData = this.getFormData();
        if (!formData) return;

        let success = false;
        if (this.editingId) {
            success = await ConcesionarioOperations.modificar(this.editingId, formData);
        } else {
            success = await ConcesionarioOperations.insertar(formData);
        }

        if (success) {
            this.hideModal();
            this.refreshData();
        }
    }

    private getFormData(): any {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const nif = (document.getElementById('nif') as HTMLInputElement).value.trim();
        const direccion = (document.getElementById('direccion') as HTMLTextAreaElement).value.trim();
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();
        
        const marcas: string[] = [];
        document.querySelectorAll('.marca-checkbox:checked').forEach(checkbox => {
            marcas.push((checkbox as HTMLInputElement).value);
        });

        if (!nombre || !nif || !direccion || !telefono || !email) {
            alert('Por favor, complete todos los campos obligatorios');
            return null;
        }

        return { nombre, nif, direccion, telefono, email, marcas };
    }

    private refreshData(): void {
        this.loadData();
    }
}