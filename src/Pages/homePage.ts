import { controllerManager } from '../Controlador/controllerManager';
import { Formatters } from '../scripts/formatters';

export class HomePage {
    render(container: HTMLElement): void {
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Welcome Section -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                    <h1 class="text-3xl font-bold mb-2">Bienvenido al Sistema de Concesionarios</h1>
                    <p class="text-blue-100">Gestiona tu concesionario de manera eficiente y profesional</p>
                </div>

                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${this.createStatsCards()}
                </div>

                <!-- Charts and Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recent Sales -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Ventas Recientes</h3>
                        ${this.createRecentSalesTable()}
                    </div>

                    <!-- Stock Status -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Estado del Stock</h3>
                        ${this.createStockStatus()}
                    </div>
                </div>

            </div>
        `;
    }

    private createStatsCards(): string {
        const concesionarios = controllerManager.concesionarioController.getCount();
        const automoviles = controllerManager.automovilController.getCount();
        const stockDisponible = controllerManager.stockController.getByEstado('disponible').length;
        const ventasTotal = controllerManager.ventaController.getTotalVentas();

        const stats = [
            {
                title: 'Concesionarios',
                value: concesionarios.toString(),
                icon: '🏢',
                color: 'bg-blue-500'
            },
            {
                title: 'Modelos de Autos',
                value: automoviles.toString(),
                icon: '🚗',
                color: 'bg-green-500'
            },
            {
                title: 'Stock Disponible',
                value: stockDisponible.toString(),
                icon: '📦',
                color: 'bg-yellow-500'
            },
            {
                title: 'Total Ventas',
                value: Formatters.formatPrice(ventasTotal),
                icon: '💰',
                color: 'bg-purple-500'
            }
        ];

        return stats.map(stat => `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="${stat.color} rounded-full p-3 text-white text-2xl mr-4">
                        ${stat.icon}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">${stat.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${stat.value}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    private createRecentSalesTable(): string {
        const ventas = controllerManager.ventaController.getAll().slice(0, 5);
        
        if (ventas.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No hay ventas registradas</p>';
        }

        const rows = ventas.map(venta => {
            const vendedor = venta.vendedorId ? 
                controllerManager.vendedorController.getById(venta.vendedorId) : null;
            const servicioOficial = venta.servicioOficialId ? 
                controllerManager.servicioOficialController.getById(venta.servicioOficialId) : null;

            return `
                <tr class="border-b">
                    <td class="py-2 px-4 text-sm">${venta.matricula}</td>
                    <td class="py-2 px-4 text-sm">${venta.clienteNombre}</td>
                    <td class="py-2 px-4 text-sm">${Formatters.formatPrice(venta.precioFinal)}</td>
                    <td class="py-2 px-4 text-sm">
                        ${vendedor ? vendedor.getNombreCompleto() : (servicioOficial ? servicioOficial.nombre : 'N/A')}
                    </td>
                    <td class="py-2 px-4 text-sm">${Formatters.formatDate(venta.fechaVenta)}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Vendido por</th>
                            <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    private createStockStatus(): string {
        const disponible = controllerManager.stockController.getByEstado('disponible').length;
        const vendido = controllerManager.stockController.getByEstado('vendido').length;
        const reservado = controllerManager.stockController.getByEstado('reservado').length;
        const total = disponible + vendido + reservado;

        const statusItems = [
            { label: 'Disponible', count: disponible, color: 'bg-green-500', percentage: total > 0 ? (disponible / total * 100) : 0 },
            { label: 'Vendido', count: vendido, color: 'bg-blue-500', percentage: total > 0 ? (vendido / total * 100) : 0 },
            { label: 'Reservado', count: reservado, color: 'bg-yellow-500', percentage: total > 0 ? (reservado / total * 100) : 0 }
        ];

        return statusItems.map(item => `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-600">${item.label}</span>
                    <span class="text-sm text-gray-500">${item.count} (${item.percentage.toFixed(1)}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="${item.color} h-2 rounded-full" style="width: ${item.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }
}