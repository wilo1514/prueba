// src/services/productService.ts
import axios from 'axios';
import { Product } from '../types';


export const getProducts = async (): Promise<Product[]> => {
    // Llamamos a /api/products
    const response = await axios.get(`http://localhost:4000/api/products`);
    console.log('Products raw data:', response.data);

    // Verificamos que sea un array
    let data: any = response.data;
    if (!Array.isArray(data)) {
        data = [];
    }

    // Transformamos la data
    const transformed = data.map((prod: any) => ({
        code: prod.codigoProducto || '',
        barcode: prod.codigoBarras || '',
        description: prod.descripcion || '',
        price: prod.precioUnitario ?? 0
    }));
    console.log('Products transformed:', transformed);

    return transformed;
};
