export class Equipamiento {
    id: string;
    nombre: string;
    descripcion: string;
    categoria: string; // 'seguridad', 'confort', 'tecnologia', etc.

    constructor(
        id: string,
        nombre: string,
        descripcion: string,
        categoria: string
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
    }
}