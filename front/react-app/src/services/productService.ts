// src/services/productService.ts
import axios from 'axios';
import { Product } from '../types';



export const getProducts = async (): Promise<Product[]> => {
    try {
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

// Actualiza el stock del producto (por ejemplo, restando la cantidad solicitada)
export const updateProductStock = async (productCode: string, quantity: number) => {
    try {
        // Se espera que el endpoint reciba { quantity } y actualice el stock
        const response = await axios.put(`http://localhost:4000/api/products/stock/${productCode}`, { quantity });
        return response.data;
    } catch (error) {
        console.error(`Error updating stock for ${productCode}:`, error);
        throw error;
    }
};