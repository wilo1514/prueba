// src/services/productService.ts
import axios from 'axios';
import { Product } from '../types';


export const getProducts = async (): Promise<Product[]> => {
    try {
        // Llamada al endpoint de productos; asegúrate que Nginx enrute /api/products al microservicio correcto.
        const response = await axios.get(`http://localhost:4000/api/products`);
        console.log('Products raw data:', response.data);
        let data: any = response.data;
        if (!Array.isArray(data)) {
            data = [];
        }
        const transformed = data.map((prod: any) => ({
            code: prod.codigoProducto.trim(),
            barcode: prod.codigoBarras.trim(),
            description: prod.descripcion.trim(),
            price: prod.precioUnitario ?? 0,
            stock: prod.stock ?? 0,
        }));
        console.log('Products transformed:', transformed);
        return transformed;
    } catch (error) {
        console.error('Error in getProducts:', error);
        return [];
    }
};

// Actualiza el stock de un producto restando la cantidad vendida o ajustando según la nueva cantidad
export const updateProductStock = async (productCode: string, quantity: number) => {
    try {
        // Llamada al endpoint para actualizar el stock. Se asume que el backend realiza la lógica de stock.
        // Por ejemplo, PUT /api/products/stock/001 con body { quantity: 2 }
        const response = await axios.put(`http://localhost:4000/api/products/stock/${productCode}`, { quantity });
        return response.data;
    } catch (error) {
        console.error(`Error updating stock for ${productCode}:`, error);
        throw error;
    }
};