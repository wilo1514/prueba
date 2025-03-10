// src/components/OrderList.tsx
import React from 'react';
import { Order } from '../types';

interface OrderListProps {
    orders: Order[];
    onEditOrder: (order: Order) => void;
    onDeleteOrder: (orderId: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onEditOrder, onDeleteOrder }) => {
    return (
        <table className="table table-striped table-bordered table-hover">
            <thead className="table-light">
                <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Subtotal</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.customer}</td>
                        <td>${order.subtotal.toFixed(2)}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => onEditOrder(order)}>
                                Editar
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => onDeleteOrder(order.id)}>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default OrderList;
