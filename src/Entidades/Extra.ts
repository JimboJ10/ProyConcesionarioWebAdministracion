export class Extra {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    equipamientoId?: string; // Referencia al equipamiento base

    constructor(
        id: string,
        nombre: string,
        descripcion: string,
        precio: number,
        categoria: string,
        equipamientoId?: string
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
        this.equipamientoId = equipamientoId;
    }
}