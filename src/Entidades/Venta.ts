export class Venta {
    id: string;
    stockId: string;
    vendedorId?: string; // Puede ser null si la venta es por servicio oficial
    servicioOficialId?: string; // Puede ser null si la venta es por vendedor
    precioFinal: number;
    modoPago: 'contado' | 'financiera';
    extrasIncluidos: { extraId: string; precio: number }[];
    fechaVenta: Date;
    fechaEntrega: Date;
    matricula: string;
    origenStock: 'stock' | 'fabrica';
    clienteNombre: string;
    clienteNif: string;
    clienteTelefono: string;

    constructor(
        id: string,
        stockId: string,
        precioFinal: number,
        modoPago: 'contado' | 'financiera',
        fechaEntrega: Date,
        matricula: string,
        origenStock: 'stock' | 'fabrica',
        clienteNombre: string,
        clienteNif: string,
        clienteTelefono: string,
        vendedorId?: string,
        servicioOficialId?: string,
        extrasIncluidos: { extraId: string; precio: number }[] = []
    ) {
        this.id = id;
        this.stockId = stockId;
        this.vendedorId = vendedorId;
        this.servicioOficialId = servicioOficialId;
        this.precioFinal = precioFinal;
        this.modoPago = modoPago;
        this.extrasIncluidos = extrasIncluidos;
        this.fechaVenta = new Date();
        this.fechaEntrega = fechaEntrega;
        this.matricula = matricula;
        this.origenStock = origenStock;
        this.clienteNombre = clienteNombre;
        this.clienteNif = clienteNif;
        this.clienteTelefono = clienteTelefono;
    }

    getPrecioExtras(): number {
        return this.extrasIncluidos.reduce((total, extra) => total + extra.precio, 0);
    }
}