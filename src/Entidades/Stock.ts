export class Stock {
    id: string;
    numeroChasis: string;
    automovilId: string;
    concesionarioId: string;
    servicioOficialId?: string;
    ubicacion: 'concesionario' | 'servicio_oficial';
    estado: 'disponible' | 'vendido' | 'reservado';
    fechaIngreso: Date;
    color: string;
    kilometraje: number;

    constructor(
        id: string,
        numeroChasis: string,
        automovilId: string,
        concesionarioId: string,
        ubicacion: 'concesionario' | 'servicio_oficial',
        color: string,
        kilometraje: number = 0,
        servicioOficialId?: string
    ) {
        this.id = id;
        this.numeroChasis = numeroChasis;
        this.automovilId = automovilId;
        this.concesionarioId = concesionarioId;
        this.servicioOficialId = servicioOficialId;
        this.ubicacion = ubicacion;
        this.estado = 'disponible';
        this.fechaIngreso = new Date();
        this.color = color;
        this.kilometraje = kilometraje;
    }
}