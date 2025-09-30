export class ServicioOficial {
    id: string;
    nombre: string;
    direccion: string;
    nif: string;
    telefono: string;
    email: string;
    concesionarioId: string; // Concesionario del que depende

    constructor(
        id: string,
        nombre: string,
        direccion: string,
        nif: string,
        telefono: string,
        email: string,
        concesionarioId: string
    ) {
        this.id = id;
        this.nombre = nombre;
        this.direccion = direccion;
        this.nif = nif;
        this.telefono = telefono;
        this.email = email;
        this.concesionarioId = concesionarioId;
    }
}