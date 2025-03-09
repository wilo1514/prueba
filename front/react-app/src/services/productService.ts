// src/services/productService.ts
import axios from 'axios';
import { Product } from '../types';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get(`${API_GATEWAY_URL}/products`);
    let data: any = response.data;

    // Si la respuesta viene en data.products:
    if (data && Array.isArray(data.products)) {
        data = data.products;
    } else if (!Array.isArray(data)) {
        data = [];
    }

    console.log('Products raw data:', data);

    // Transformar y hacer trim
    const transformed = data.map((prod: any) => ({
        code: prod.codigoProducto,        // '001'
        barcode: prod.codigoBarras,       // '454545406826820'
        description: prod.descripcion,    // 'Torta de chocolate'
        price: prod.precioUnitario,       // 10
    }));

    console.log('Products transformed:', transformed);
    return transformed;
};
