// src/components/OrderItemRow.tsx
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';
import { OrderItem } from '../types';

interface OrderItemRowProps {
    item: OrderItem;
    onUpdate: (id: string, field: keyof OrderItem, value: any) => void;
    onRemove: (id: string) => void;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({ item, onUpdate, onRemove }) => {
    return (
        <tr>
            <td>
                <Form.Control
                    type="text"
                    value={item.productCode}
                    onChange={(e) => onUpdate(item.id, 'productCode', e.target.value)}
                />
            </td>
            <td>
                <Form.Control
                    type="text"
                    value={item.barcode}
                    onChange={(e) => onUpdate(item.id, 'barcode', e.target.value)}
                />
            </td>
            <td>
                <Form.Control
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                />
            </td>
            <td>
                <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                        onUpdate(item.id, 'quantity', parseInt(e.target.value) || 0)
                    }
                />
            </td>
            <td>
                <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) =>
                        onUpdate(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                />
            </td>
            <td>
                <Form.Select
                    value={item.vat}
                    onChange={(e) => onUpdate(item.id, 'vat', parseInt(e.target.value))}
                >
                    <option value="15">15%</option>
                    <option value="3">3%</option>
                    <option value="0">0%</option>
                </Form.Select>
            </td>
            <td>${item.subtotal.toFixed(2)}</td>
            <td>
                <Button variant="outline-danger" size="sm" onClick={() => onRemove(item.id)}>
                    <Trash2 size={16} />
                </Button>
            </td>
        </tr>
    );
};

export default OrderItemRow;
