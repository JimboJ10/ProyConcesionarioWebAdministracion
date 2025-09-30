export class Validators {
    // Validar NIF/CIF español
    static validateNIF(nif: string): boolean {
        const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        if (!nifRegex.test(nif)) return false;
        
        const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const number = parseInt(nif.substring(0, 8));
        const letter = nif.charAt(8).toUpperCase();
        
        return letters.charAt(number % 23) === letter;
    }

    // Validar email
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar teléfono
    static validatePhone(phone: string): boolean {
        const phoneRegex = /^[0-9]{9,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Validar número de chasis (VIN)
    static validateVIN(vin: string): boolean {
        const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
        return vinRegex.test(vin);
    }

    // Validar matrícula española
    static validateMatricula(matricula: string): boolean {
        const matriculaRegex = /^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;
        return matriculaRegex.test(matricula.replace(/[\s\-]/g, ''));
    }

    // Validar precio (mayor que 0)
    static validatePrice(price: number): boolean {
        return price > 0 && !isNaN(price);
    }

    // Validar descuento (0-100%)
    static validateDiscount(discount: number): boolean {
        return discount >= 0 && discount <= 100 && !isNaN(discount);
    }
}