export class Vendedor {
    id: string;
    nombre: string;
    apellidos: string;
    nif: string;
    direccion: string;
    telefono: string;
    email: string;
    concesionarioId: string;
    fechaIngreso: Date;
    salario: number;

    constructor(
        id: string,
        nombre: string,
        apellidos: string,
        nif: string,
        direccion: string,
        telefono: string,
        email: string,
        concesionarioId: string,
        salario: number
    ) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.nif = nif;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.concesionarioId = concesionarioId;
        this.fechaIngreso = new Date();
        this.salario = salario;
    }

    getNombreCompleto(): string {
        return `${this.nombre} ${this.apellidos}`;
    }
}