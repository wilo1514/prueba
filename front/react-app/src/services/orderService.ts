// src/services/orderService.ts
import axios from 'axios';
import { Order } from '../types';

const API_GATEWAY_URL = import.meta.env.REACT_APP_API_GATEWAY_URL;

export const createOrder = async (order: Order): Promise<Order> => {
    const response = await axios.post(`${API_GATEWAY_URL}/orders`, order);
    return response.data;
};

export const updateOrder = async (order: Order): Promise<Order> => {
    const response = await axios.put(`${API_GATEWAY_URL}/orders/${order.id}`, order);
    return response.data;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    await axios.delete(`${API_GATEWAY_URL}/orders/${orderId}`);
};
