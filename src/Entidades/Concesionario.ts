export class Concesionario {
    id: string;
    nombre: string;
    direccion: string;
    nif: string;
    telefono: string;
    email: string;
    marcas: string[]; // Marcas que vende (Audi, Volkswagen, etc.)

    constructor(
        id: string,
        nombre: string,
        direccion: string,
        nif: string,
        telefono: string,
        email: string,
        marcas: string[] = []
    ) {
        this.id = id;
        this.nombre = nombre;
        this.direccion = direccion;
        this.nif = nif;
        this.telefono = telefono;
        this.email = email;
        this.marcas = marcas;
    }
}