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

const OrderItemRow: React.FC<OrderItemRowProps> = ({ item, allProducts, onUpdateItem, onRemoveItem, onProductSelect }) => {
    // Estados locales para la búsqueda en cada campo
    const [searchCode, setSearchCode] = useState('');
    const [searchBarcode, setSearchBarcode] = useState('');
    const [searchDescription, setSearchDescription] = useState('');

    const filteredByCode = searchCode.trim().length >= 2
        ? allProducts.filter(p => p.code.toLowerCase().includes(searchCode.trim().toLowerCase()))
        : [];
    const filteredByBarcode = searchBarcode.trim().length >= 2
        ? allProducts.filter(p => p.barcode.toLowerCase().includes(searchBarcode.trim().toLowerCase()))
        : [];
    const filteredByDescription = searchDescription.trim().length >= 2
        ? allProducts.filter(p => p.description.toLowerCase().includes(searchDescription.trim().toLowerCase()))
        : [];

    return (
        <tr>
            <td style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="form-control"
                    value={item.productCode}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        onUpdateItem(item.id, 'productCode', newVal);
                        setSearchCode(newVal);
                    }}
                />
                {searchCode.trim().length >= 2 && filteredByCode.length > 0 && (
                    <div className="position-absolute bg-white border border-secondary w-100" style={{ top: '100%', zIndex: 1000, maxHeight: '150px', overflowY: 'auto' }}>
                        {filteredByCode.map(product => (
                            <div key={product.code} className="p-2" style={{ cursor: 'pointer' }} onClick={() => {
                                onProductSelect(item.id, product);
                                setSearchCode('');
                            }}>
                                <strong>{product.code}</strong>
                            </div>
                        ))}
                    </div>
                )}
            </td>
            <td style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="form-control"
                    value={item.barcode}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        onUpdateItem(item.id, 'barcode', newVal);
                        setSearchBarcode(newVal);
                    }}
                />
                {searchBarcode.trim().length >= 2 && filteredByBarcode.length > 0 && (
                    <div className="position-absolute bg-white border border-secondary w-100" style={{ top: '100%', zIndex: 1000, maxHeight: '150px', overflowY: 'auto' }}>
                        {filteredByBarcode.map(product => (
                            <div key={product.code} className="p-2" style={{ cursor: 'pointer' }} onClick={() => {
                                onProductSelect(item.id, product);
                                setSearchBarcode('');
                            }}>
                                <strong>{product.barcode}</strong>
                            </div>
                        ))}
                    </div>
                )}
            </td>
            <td style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="form-control"
                    value={item.description}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        onUpdateItem(item.id, 'description', newVal);
                        setSearchDescription(newVal);
                    }}
                />
                {searchDescription.trim().length >= 2 && filteredByDescription.length > 0 && (
                    <div className="position-absolute bg-white border border-secondary w-100" style={{ top: '100%', zIndex: 1000, maxHeight: '150px', overflowY: 'auto' }}>
                        {filteredByDescription.map(product => (
                            <div key={product.code} className="p-2" style={{ cursor: 'pointer' }} onClick={() => {
                                onProductSelect(item.id, product);
                                setSearchDescription('');
                            }}>
                                {product.description}
                            </div>
                        ))}
                    </div>
                )}
            </td>
            <td>
                <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                />
            </td>
            <td>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={item.unitPrice}
                    onChange={(e) => onUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                />
            </td>
            <td>
                <select
                    className="form-select"
                    value={item.vat}
                    onChange={(e) => onUpdateItem(item.id, 'vat', parseInt(e.target.value))}
                >
                    <option value="15">15%</option>
                    <option value="3">3%</option>
                    <option value="0">0%</option>
                </select>
            </td>
            <td>${item.subtotal.toFixed(2)}</td>
            <td>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onRemoveItem(item.id)}>
                    <i className="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    );
};

export default OrderItemRow;
