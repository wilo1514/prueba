// src/utils/calculations.ts
import { OrderItem } from '../types';

export const calculateTotals = (orderItems: OrderItem[]) => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const vatAmount = orderItems.reduce((sum, item) => sum + (item.subtotal * item.vat) / 100, 0);
    return {
        subtotal: subtotal.toFixed(2),
        vat: vatAmount.toFixed(2),
        total: (subtotal + vatAmount).toFixed(2),
    };
};
