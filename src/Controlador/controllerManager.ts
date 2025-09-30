import { ConcesionarioController } from './ConcesionarioController';
import { AutomovilController } from './AutomovilController';
import { VendedorController } from './VendedorController';
import { StockController } from './StockController';
import { ServicioOficialController } from './ServicioOficialController';
import { EquipamientoController } from './EquipamientoController';
import { ExtraController } from './ExtraController';
import { VentaController } from './VentaController';

export class ControllerManager {
    public concesionarioController: ConcesionarioController;
    public automovilController: AutomovilController;
    public vendedorController: VendedorController;
    public stockController: StockController;
    public servicioOficialController: ServicioOficialController;
    public equipamientoController: EquipamientoController;
    public extraController: ExtraController;
    public ventaController: VentaController;

    constructor() {
        this.concesionarioController = new ConcesionarioController();
        this.automovilController = new AutomovilController();
        this.vendedorController = new VendedorController();
        this.stockController = new StockController();
        this.servicioOficialController = new ServicioOficialController();
        this.equipamientoController = new EquipamientoController();
        this.extraController = new ExtraController();
        this.ventaController = new VentaController();
    }

    // Inicializar todos los controladores con datos de ejemplo
    initializeAllWithSampleData(): void {
        this.concesionarioController.initializeWithSampleData();
        this.automovilController.initializeWithSampleData();
        this.vendedorController.initializeWithSampleData();
        this.stockController.initializeWithSampleData();
        this.servicioOficialController.initializeWithSampleData();
        this.equipamientoController.initializeWithSampleData();
        this.extraController.initializeWithSampleData();
        this.ventaController.initializeWithSampleData();
    }

    // Limpiar todos los datos
    clearAllData(): void {
        this.concesionarioController.clear();
        this.automovilController.clear();
        this.vendedorController.clear();
        this.stockController.clear();
        this.servicioOficialController.clear();
        this.equipamientoController.clear();
        this.extraController.clear();
        this.ventaController.clear();
    }
}

// Instancia global del manager
export const controllerManager = new ControllerManager();