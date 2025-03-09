// src/components/OrderModal.tsx
import React from 'react';
import { Order, OrderItem, Customer, Product } from '../types';

interface OrderModalProps {
    show: boolean;
    editingOrder: Order | null;
    selectedCustomer: Customer | null;
    orderItems: OrderItem[];
    totals: { subtotal: string; vat: string; total: string };
    onHide: () => void;
    onSave: () => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, field: keyof OrderItem, value: any) => void;
    onCustomerChange: (customer: Customer) => void;
    onCustomerSearch: (searchTerm: string) => void;
    customerSearchTerm: string;
    filteredCustomers: Customer[];
    // Props para búsqueda de productos:
    productSearchTerm: string;
    onProductSearchChange: (searchTerm: string) => void;
    filteredProducts: Product[];
    onProductSelect: (orderItemId: string, product: Product) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
    show,
    editingOrder,
    selectedCustomer,
    orderItems,
    totals,
    onHide,
    onSave,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    onCustomerChange,
    onCustomerSearch,
    customerSearchTerm,
    filteredCustomers,
    productSearchTerm,
    onProductSearchChange,
    filteredProducts,
    onProductSelect,
}) => {
    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show"
                tabIndex={-1}
                style={{ display: 'block' }}
                aria-modal="true"
                role="dialog"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        {/* Modal Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={onHide}
                            ></button>
                        </div>
                        {/* Modal Body */}
                        <div className="modal-body">
                            <form>
                                {/* Información del Cliente */}
                                <div className="mb-3">
                                    <label htmlFor="customerSearch" className="form-label">
                                        Buscar Cliente
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="customerSearch"
                                        placeholder="Ingrese nombre o RUC..."
                                        value={customerSearchTerm}
                                        onChange={(e) => onCustomerSearch(e.target.value)}
                                    />
                                    {customerSearchTerm.length >= 3 && filteredCustomers.length > 0 && (
                                        <div
                                            className="border border-secondary mt-1"
                                            style={{ maxHeight: '150px', overflowY: 'auto' }}
                                        >
                                            {filteredCustomers.map((customer) => (
                                                <div
                                                    key={customer.rucCi}
                                                    className="p-2"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => onCustomerChange(customer)}
                                                >
                                                    <strong>{customer.companyName}</strong> - {customer.rucCi}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Mostrar campos autocompletados del Cliente */}
                                {selectedCustomer && (
                                    <div className="mb-3">
                                        <label className="form-label">Detalles del Cliente</label>
                                        <div className="mb-1">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedCustomer.companyName}
                                                readOnly
                                                placeholder="Nombre"
                                            />
                                        </div>
                                        <div className="mb-1">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedCustomer.rucCi}
                                                readOnly
                                                placeholder="RUC / CI"
                                            />
                                        </div>
                                        <div className="mb-1">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedCustomer.address}
                                                readOnly
                                                placeholder="Dirección"
                                            />
                                        </div>
                                        <div className="mb-1">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedCustomer.phone}
                                                readOnly
                                                placeholder="Teléfono"
                                            />
                                        </div>
                                        <div className="mb-1">
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={selectedCustomer.email}
                                                readOnly
                                                placeholder="Email"
                                            />
                                        </div>
                                    </div>
                                )}

                                <hr />

                                {/* Productos */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Productos</h5>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={onAddItem}
                                    >
                                        Agregar Producto
                                    </button>
                                </div>
                                <table className="table table-striped table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Barcode</th>
                                            <th>Descripción</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>IVA %</th>
                                            <th>Subtotal</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={item.productCode}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            onUpdateItem(item.id, 'productCode', newValue);
                                                            // Umbral para productos: 2 caracteres
                                                            onProductSearchChange(newValue);
                                                        }}
                                                    />
                                                    {productSearchTerm.length >= 2 &&
                                                        filteredProducts.length > 0 && (
                                                            <div
                                                                className="position-absolute bg-white border border-secondary w-100"
                                                                style={{
                                                                    top: '100%',
                                                                    zIndex: 1000,
                                                                    maxHeight: '150px',
                                                                    overflowY: 'auto',
                                                                }}
                                                            >
                                                                {filteredProducts.map((product) => (
                                                                    <div
                                                                        key={product.code}
                                                                        className="p-2"
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => onProductSelect(item.id, product)}
                                                                    >
                                                                        <strong>{product.code}</strong> -{' '}
                                                                        {product.description}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={item.barcode}
                                                        onChange={(e) =>
                                                            onUpdateItem(item.id, 'barcode', e.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            onUpdateItem(item.id, 'description', e.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="form-control"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            onUpdateItem(
                                                                item.id,
                                                                'quantity',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="form-control"
                                                        value={item.unitPrice}
                                                        onChange={(e) =>
                                                            onUpdateItem(
                                                                item.id,
                                                                'unitPrice',
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={item.vat}
                                                        onChange={(e) =>
                                                            onUpdateItem(item.id, 'vat', parseInt(e.target.value))
                                                        }
                                                    >
                                                        <option value="15">15%</option>
                                                        <option value="3">3%</option>
                                                        <option value="0">0%</option>
                                                    </select>
                                                </td>
                                                <td>${item.subtotal.toFixed(2)}</td>
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
                                        ))}
                                    </tbody>
                                </table>
                                {/* Totales */}
                                <div className="d-flex justify-content-end">
                                    <div style={{ width: '300px' }}>
                                        <div className="d-flex justify-content-between">
                                            <strong>Subtotal:</strong>
                                            <span>${totals.subtotal}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <strong>IVA:</strong>
                                            <span>${totals.vat}</span>
                                        </div>
                                        <div className="d-flex justify-content-between h5">
                                            <strong>Total:</strong>
                                            <span>${totals.total}</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* Modal Footer */}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-primary" onClick={onSave}>
                                {editingOrder ? 'Actualizar Pedido' : 'Crear Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderModal;
