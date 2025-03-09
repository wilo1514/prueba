// src/components/OrderList.tsx
import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { Edit2, Trash2 } from 'lucide-react';
import { Order } from '../types';

interface OrderListProps {
    orders: Order[];
    onEditOrder: (order: Order) => void;
    onDeleteOrder: (orderId: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onEditOrder, onDeleteOrder }) => {
    return (
        <Table striped bordered hover responsive>
            <thead className="thead-light">
                <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Subtotal</th>
                    <th>Total (Inc. Taxes)</th>
                    <th className="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.customer}</td>
                        <td>${order.subtotal.toFixed(2)}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td className="text-center">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onEditOrder(order)}
                                className="me-2"
                            >
                                <Edit2 size={16} />
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onDeleteOrder(order.id)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default OrderList;
