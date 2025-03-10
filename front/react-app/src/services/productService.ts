// src/services/productService.ts
import axios from 'axios';
import { Product } from '../types';

const API_GATEWAY_URL = `http://localhost:4000`;

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/products`);
        let data: any = response.data;
        if (!Array.isArray(data)) {
            data = [];
        }
        return data.map((prod: any) => ({
            code: prod.codigoProducto.trim(),
            barcode: prod.codigoBarras.trim(),
            description: prod.descripcion.trim(),
            price: prod.precioUnitario ?? 0,
            stock: prod.stock ?? 0,
        }));
    } catch (error) {
        console.error('Error in getProducts:', error);
        return [];
    }
};

// Actualiza el stock de un producto enviando oldQuantity y newQuantity
export const updateProductStock = async (productCode: string, oldQuantity: number, newQuantity: number) => {
    try {
        const response = await axios.put(`${API_GATEWAY_URL}/api/products/stock/${productCode}`, {
            oldQuantity,
            newQuantity
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating stock for ${productCode}:`, error);
        throw error;
    }
};
