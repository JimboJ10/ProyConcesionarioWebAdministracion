import { HomePage } from './homePage';
import { ConcesionarioPage } from './concesionarioPage';
import { AutomovilPage } from './automovilPage';
import { VendedorPage } from './vendedorPage';
import { StockPage } from './stockPage';
import { ServicioOficialPage } from './servicioOficialPage';
import { EquipamientoPage } from './equipamientoPage';
import { ExtraPage } from './extraPage';
import { VentaPage } from './ventaPage';

export class DashboardManager {
    private currentPage: string = 'home';
    private pages: { [key: string]: any } = {};

    constructor() {
        this.pages = {
            home: new HomePage(),
            concesionarios: new ConcesionarioPage(),
            automoviles: new AutomovilPage(),
            vendedores: new VendedorPage(),
            stock: new StockPage(),
            serviciosOficiales: new ServicioOficialPage(),
            equipamientos: new EquipamientoPage(),
            extras: new ExtraPage(),
            ventas: new VentaPage()
        };
    }

    init(): void {
        this.createLayout();
        this.showPage('home');
        this.setupNavigation();
    }

    private createLayout(): void {
        const app = document.querySelector<HTMLDivElement>('#app')!;
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex">
                <!-- Sidebar -->
                <div id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col">
                    <div class="flex items-center justify-center h-16 bg-blue-600 text-white flex-shrink-0">
                        <h1 class="text-xl font-bold">🚗 AutoManager</h1>
                    </div>
                    <nav class="flex-1 overflow-y-auto py-4">
                        ${this.createSidebarMenu()}
                    </nav>
                </div>

                <!-- Main Content Container -->
                <div class="flex-1 flex flex-col min-h-screen lg:ml-0">
                    <!-- Top Navigation -->
                    <header class="bg-white shadow-sm border-b flex-shrink-0">
                        <div class="px-4 sm:px-6 lg:px-8">
                            <div class="flex justify-between h-16">
                                <div class="flex items-center">
                                    <button id="menu-toggle" class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <h2 id="page-title" class="ml-4 text-xl font-semibold text-gray-800">Dashboard</h2>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class="text-sm text-gray-500">Sistema de Concesionarios</span>
                                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span class="text-white text-sm font-medium">U</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <!-- Page Content -->
                    <main id="main-content" class="flex-1 p-6 overflow-auto">
                        <!-- El contenido de cada página se cargará aquí -->
                    </main>
                </div>

                <!-- Mobile menu overlay -->
                <div id="menu-overlay" class="fixed inset-0 z-40 bg-black bg-opacity-50 hidden lg:hidden"></div>
            </div>
        `;
    }

    private createSidebarMenu(): string {
        const menuItems = [
            { id: 'home', icon: '🏠', label: 'Dashboard', active: true },
            { id: 'concesionarios', icon: '🏢', label: 'Concesionarios' },
            { id: 'automoviles', icon: '🚗', label: 'Automóviles' },
            { id: 'vendedores', icon: '👤', label: 'Vendedores' },
            { id: 'stock', icon: '📦', label: 'Stock' },
            { id: 'serviciosOficiales', icon: '🏪', label: 'Servicios Oficiales' },
            { id: 'equipamientos', icon: '⚙️', label: 'Equipamientos' },
            { id: 'extras', icon: '✨', label: 'Extras' },
            { id: 'ventas', icon: '💰', label: 'Ventas' }
        ];

        return menuItems.map(item => `
            <a href="#" 
               data-page="${item.id}" 
               class="menu-item group flex items-center px-4 py-3 mx-3 mb-1 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ${item.active ? 'bg-blue-50 text-blue-600 shadow-md' : ''}">
                <span class="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">${item.icon}</span>
                <span class="font-medium">${item.label}</span>
            </a>
        `).join('');
    }

    private setupNavigation(): void {
        // Toggle mobile menu
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('menu-overlay');

        menuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('-translate-x-full');
            overlay?.classList.toggle('hidden');
        });

        overlay?.addEventListener('click', () => {
            sidebar?.classList.add('-translate-x-full');
            overlay?.classList.add('hidden');
        });

        // Navigation menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = (e.currentTarget as HTMLElement).getAttribute('data-page');
                if (pageId) {
                    this.showPage(pageId);
                    this.setActiveMenuItem(pageId);
                    
                    // Close mobile menu
                    sidebar?.classList.add('-translate-x-full');
                    overlay?.classList.add('hidden');
                }
            });
        });
    }

    private setActiveMenuItem(pageId: string): void {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('bg-blue-50', 'text-blue-600', 'shadow-md');
            item.classList.add('text-gray-700');
        });

        const activeItem = document.querySelector(`[data-page="${pageId}"]`);
        if (activeItem) {
            activeItem.classList.add('bg-blue-50', 'text-blue-600', 'shadow-md');
            activeItem.classList.remove('text-gray-700');
        }
    }

    showPage(pageId: string): void {
        this.currentPage = pageId;
        const pageTitle = document.getElementById('page-title');
        const mainContent = document.getElementById('main-content');

        if (this.pages[pageId] && mainContent) {
            this.pages[pageId].render(mainContent);
            
            // Update page title
            const titles: { [key: string]: string } = {
                home: 'Dashboard',
                concesionarios: 'Gestión de Concesionarios',
                automoviles: 'Gestión de Automóviles',
                vendedores: 'Gestión de Vendedores',
                stock: 'Gestión de Stock',
                serviciosOficiales: 'Servicios Oficiales',
                equipamientos: 'Equipamientos',
                extras: 'Extras',
                ventas: 'Gestión de Ventas'
            };

            if (pageTitle) {
                pageTitle.textContent = titles[pageId] || 'Dashboard';
            }
        }
    }
}