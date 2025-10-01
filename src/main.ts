import './style.css'
import { DashboardManager } from './Pages/dashboardManager';
import { controllerManager } from './Controlador/controllerManager';

// Inicializar datos de ejemplo
controllerManager.initializeAllWithSampleData();

// Inicializar dashboard
const dashboardManager = new DashboardManager();
dashboardManager.init();