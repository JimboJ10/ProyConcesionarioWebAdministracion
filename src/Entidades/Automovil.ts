export class Automovil {
    id: string;
    marca: string;
    modelo: string;
    precio: number;
    descuento: number;
    potenciaFiscal: number;
    cilindrada: number;
    combustible: string;
    transmision: string;
    equipamientoSerie: string[]; // IDs de equipamientos incluidos de serie
    extrasDisponibles: string[]; // IDs de extras disponibles

    constructor(
        id: string,
        marca: string,
        modelo: string,
        precio: number,
        descuento: number = 0,
        potenciaFiscal: number,
        cilindrada: number,
        combustible: string,
        transmision: string,
        equipamientoSerie: string[] = [],
        extrasDisponibles: string[] = []
    ) {
        this.id = id;
        this.marca = marca;
        this.modelo = modelo;
        this.precio = precio;
        this.descuento = descuento;
        this.potenciaFiscal = potenciaFiscal;
        this.cilindrada = cilindrada;
        this.combustible = combustible;
        this.transmision = transmision;
        this.equipamientoSerie = equipamientoSerie;
        this.extrasDisponibles = extrasDisponibles;
    }

    getPrecioConDescuento(): number {
        return this.precio - (this.precio * this.descuento / 100);
    }
}