export const CONSTANTS = {
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
    },

    // Marcas de automóviles disponibles
    CAR_BRANDS: [
        'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Ford', 
        'Toyota', 'Nissan', 'Hyundai', 'Kia', 'Seat', 'Skoda',
        'Peugeot', 'Citroën', 'Renault', 'Opel', 'Fiat'
    ],

    // Tipos de combustible
    FUEL_TYPES: [
        'Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'GLP', 'GNC'
    ],

    // Tipos de transmisión
    TRANSMISSION_TYPES: [
        'Manual', 'Automático', 'Semi-automático'
    ],

    // Categorías de equipamiento
    EQUIPMENT_CATEGORIES: [
        'Seguridad', 'Confort', 'Tecnología', 'Estética', 'Rendimiento'
    ],

    // Estados de stock
    STOCK_STATES: [
        'disponible', 'vendido', 'reservado'
    ],

    // Ubicaciones de stock
    STOCK_LOCATIONS: [
        'concesionario', 'servicio_oficial'
    ],

    // Modos de pago
    PAYMENT_METHODS: [
        'contado', 'financiera'
    ],

    // Origen de stock
    STOCK_ORIGINS: [
        'stock', 'fabrica'
    ],

    // Colores de vehículos
    CAR_COLORS: [
        'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 
        'Verde', 'Amarillo', 'Naranja', 'Marrón', 'Beige',
        'Blanco Perla', 'Negro Metalizado', 'Gris Metalizado',
        'Azul Metalizado', 'Rojo Metalizado'
    ],

    // Validaciones
    VALIDATION: {
        MIN_PRICE: 1000,
        MAX_PRICE: 500000,
        MIN_DISCOUNT: 0,
        MAX_DISCOUNT: 100,
        MIN_HORSEPOWER: 50,
        MAX_HORSEPOWER: 1000,
        MIN_DISPLACEMENT: 800,
        MAX_DISPLACEMENT: 8000
    },

    // Mensajes
    MESSAGES: {
        SUCCESS: {
            CREATED: 'Registro creado exitosamente',
            UPDATED: 'Registro actualizado exitosamente',
            DELETED: 'Registro eliminado exitosamente'
        },
        ERROR: {
            VALIDATION: 'Error de validación',
            NOT_FOUND: 'Registro no encontrado',
            DUPLICATE: 'Ya existe un registro con esos datos',
            GENERAL: 'Ha ocurrido un error inesperado'
        },
        CONFIRM: {
            DELETE: '¿Estás seguro de que deseas eliminar este registro?'
        }
    }
};