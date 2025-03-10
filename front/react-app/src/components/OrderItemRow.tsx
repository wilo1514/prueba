// src/components/OrderItemRow.tsx
import React, { useState } from 'react';
import { OrderItem, Product } from '../types';

interface OrderItemRowProps {
    item: OrderItem;
    allProducts: Product[];
    onUpdateItem: (id: string, field: keyof OrderItem, value: any) => void;
    onRemoveItem: (id: string) => void;
    onProductSelect: (orderItemId: string, product: Product) => void;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({
    item,
    allProducts,
    onUpdateItem,
    onRemoveItem,
    onProductSelect,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filtra productos por código, barcode o descripción
    const filteredProducts = searchTerm.trim().length >= 2
        ? allProducts.filter((p) =>
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    // Manejador para cantidad
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQty = parseInt(e.target.value, 10) || 0;
        onUpdateItem(item.id, 'quantity', newQty);
    };

    // Manejador para IVA
    const handleVatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVat = parseInt(e.target.value, 10) || 0;
        onUpdateItem(item.id, 'vat', newVat);
    };

    return (
        <tr>
            {/* Campo único de búsqueda */}
            <td style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm.trim().length >= 2 && filteredProducts.length > 0 && (
                    <div
                        className="position-absolute bg-white border border-secondary w-100"
                        style={{ top: '100%', zIndex: 1000, maxHeight: '150px', overflowY: 'auto' }}
                    >
                        {filteredProducts.map((product) => (
                            <div
                                key={product.code}
                                className="p-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    onProductSelect(item.id, product);
                                    setSearchTerm('');
                                }}
                            >
                                <strong>{product.code}</strong> - {product.barcode} - {product.description}
                            </div>
                        ))}
                    </div>
                )}
            </td>

            {/* Código (solo lectura) */}
            <td>
                <input
                    type="text"
                    className="form-control"
                    value={item.productCode}
                    readOnly
                />
            </td>

            {/* Barcode (solo lectura) */}
            <td>
                <input
                    type="text"
                    className="form-control"
                    value={item.barcode}
                    readOnly
                />
            </td>

            {/* Descripción (solo lectura) */}
            <td>
                <input
                    type="text"
                    className="form-control"
                    value={item.description}
                    readOnly
                />
            </td>

            {/* Cantidad (editable) */}
            <td>
                <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity}
                    onChange={handleQuantityChange}
                />
            </td>

            {/* Precio Unitario (solo lectura) */}
            <td>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={item.unitPrice}
                    readOnly
                />
            </td>

            {/* IVA (editable) */}
            <td>
                <select
                    className="form-select"
                    value={item.vat}
                    onChange={handleVatChange}
                >
                    <option value="15">15%</option>
                    <option value="3">3%</option>
                    <option value="0">0%</option>
                </select>
            </td>

            {/* Subtotal (solo lectura) */}
            <td>${item.subtotal.toFixed(2)}</td>

            {/* Botón para eliminar la fila */}
            <td>
                <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onRemoveItem(item.id)}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    );
};

export default OrderItemRow;
