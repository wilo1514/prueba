// src/services/customerService.ts
import axios from 'axios';
import { Customer } from '../types';

const API_GATEWAY_URL = import.meta.env.REACT_APP_API_GATEWAY_URL;

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await axios.get(`${API_GATEWAY_URL}/customers`);
    return response.data;
};
