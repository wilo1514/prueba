// src/services/orderService.ts
import axios from 'axios';
import { Order } from '../types';

const API_GATEWAY_URL = import.meta.env.REACT_APP_API_GATEWAY_URL;

const transformOrder = (order: any): Order => {
    // Asumiendo que tu Order tiene una propiedad 'id'
    return { ...order, id: order._id };
};

export const createOrder = async (order: Order): Promise<Order> => {
    const response = await axios.post(`${API_GATEWAY_URL}/invoices`, order);
    return transformOrder(response.data);
};

export const updateOrder = async (order: Order): Promise<Order> => {
    const response = await axios.put(`${API_GATEWAY_URL}/invoices/${order.id}`, order);
    return transformOrder(response.data);
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    await axios.delete(`${API_GATEWAY_URL}/invoices/${orderId}`);
};