// Test de funciones utilitarias y cálculos del carrito
// Basado en las funciones auxiliares de carrito.js

describe('Utilidades del Carrito (Cálculos y Formato)', function() {
    
    // Copia exacta de la lógica dentro de calcularTotalPagina en carrito.js
    const calcularTotalLogica = function(carritoArray) {
        return carritoArray.reduce((sum, producto) => {
            return sum + ((producto.precio || 0) * (producto.cantidad || 1));
        }, 0);
    };

    // Copia exacta de formatearMoneda de carrito.js
    const formatearMoneda = function(valor) {
        const numero = Number(valor);
        if (isNaN(numero)) return "$0";
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(numero);
    };
    
    describe('Cálculo de Totales (reduce)', function() {
        
        it('Debe sumar precio * cantidad para todos los items', function() {
            const carrito = [
                { id: '1', precio: 1000, cantidad: 2 }, // 2000
                { id: '2', precio: 500, cantidad: 1 }   // 500
            ];
            
            const total = calcularTotalLogica(carrito);
            expect(total).toBe(2500);
        });
        
        it('Debe devolver 0 si el carrito está vacío', function() {
            const carrito = [];
            const total = calcularTotalLogica(carrito);
            expect(total).toBe(0);
        });
        
        it('Debe asumir cantidad 1 si la propiedad no existe', function() {
            // Tu código tiene (producto.cantidad || 1)
            const carrito = [
                { id: '1', precio: 5000 } // sin cantidad explícita
            ];
            const total = calcularTotalLogica(carrito);
            expect(total).toBe(5000);
        });

        it('Debe manejar productos con precio 0 o indefinido', function() {
            const carrito = [
                { id: '1', cantidad: 5 } // precio undefined -> 0
            ];
            const total = calcularTotalLogica(carrito);
            expect(total).toBe(0);
        });
    });
    
    describe('Formateo de Moneda (CLP)', function() {
        
        it('Debe formatear números con separador de miles y símbolo $', function() {
            const resultado = formatearMoneda(1000);
            // Verificamos partes clave porque el espacio (nbsp) puede variar
            expect(resultado).toContain('$');
            expect(resultado).toContain('1.000');
        });
        
        it('Debe formatear valores grandes correctamente', function() {
            const resultado = formatearMoneda(1500000);
            expect(resultado).toContain('1.500.000');
        });

        it('Debe manejar valores no numéricos devolviendo "$0"', function() {
            expect(formatearMoneda("texto")).toBe("$0");
            expect(formatearMoneda(null)).toBe("$0");
            expect(formatearMoneda(undefined)).toBe("$0");
        });
    });
});