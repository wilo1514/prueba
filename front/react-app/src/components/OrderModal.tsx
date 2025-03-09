import React from 'react';
import { Order, OrderItem, Customer, Product } from '../types';
import OrderItemRow from './OrderItemRow';

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
    // Para productos, ahora enviamos la lista completa
    allProducts: Product[];
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
    allProducts,
    onProductSelect,
}) => {
    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show" tabIndex={-1} style={{ display: 'block' }} aria-modal="true" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        {/* Modal Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">{editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onHide}></button>
                        </div>
                        {/* Modal Body */}
                        <div className="modal-body">
                            <form>
                                {/* Información del Cliente */}
                                <div className="mb-3">
                                    <label htmlFor="customerSearch" className="form-label">Buscar Cliente</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="customerSearch"
                                        placeholder="Ingrese nombre o RUC..."
                                        value={customerSearchTerm}
                                        onChange={(e) => onCustomerSearch(e.target.value)}
                                    />
                                    {customerSearchTerm.length >= 3 && filteredCustomers.length > 0 && (
                                        <div className="border border-secondary mt-1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
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

                                {selectedCustomer && (
                                    <div className="mb-3">
                                        <label className="form-label">Detalles del Cliente</label>
                                        <div className="mb-1">
                                            <input type="text" className="form-control" value={selectedCustomer.companyName} readOnly placeholder="Nombre" />
                                        </div>
                                        <div className="mb-1">
                                            <input type="text" className="form-control" value={selectedCustomer.rucCi} readOnly placeholder="RUC / CI" />
                                        </div>
                                        <div className="mb-1">
                                            <input type="text" className="form-control" value={selectedCustomer.address} readOnly placeholder="Dirección" />
                                        </div>
                                        <div className="mb-1">
                                            <input type="text" className="form-control" value={selectedCustomer.phone} readOnly placeholder="Teléfono" />
                                        </div>
                                        <div className="mb-1">
                                            <input type="email" className="form-control" value={selectedCustomer.email} readOnly placeholder="Email" />
                                        </div>
                                    </div>
                                )}

                                <hr />

                                {/* Sección de Productos */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Productos</h5>
                                    <button type="button" className="btn btn-outline-primary" onClick={onAddItem}>
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
                                            <OrderItemRow
                                                key={item.id}
                                                item={item}
                                                allProducts={allProducts}
                                                onUpdateItem={onUpdateItem}
                                                onRemoveItem={onRemoveItem}
                                                onProductSelect={onProductSelect}
                                            />
                                        ))}
                                    </tbody>
                                </table>
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
