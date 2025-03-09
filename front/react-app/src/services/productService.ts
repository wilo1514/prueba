// src/services/productService.ts
import axios from 'axios';
import { Product } from '../types';

const API_GATEWAY_URL = import.meta.env.REACT_APP_API_GATEWAY_URL;

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get(`${API_GATEWAY_URL}/products`);
    return response.data;
};
