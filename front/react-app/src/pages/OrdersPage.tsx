// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import OrderList from '../components/OrderList';
import OrderModal from '../components/OrderModal';
import { Order, OrderItem, Customer } from '../types';
import { calculateTotals } from '../utils/calculations';

// Datos de ejemplo para clientes (puedes reemplazar por llamadas a customerService)
const mockCustomers: Customer[] = [
    {
        companyName: 'Tech Corp',
        rucCi: '20123456789',
        address: '123 Tech Street',
        phone: '555-0123',
        email: 'contact@techcorp.com'
    },
    {
        companyName: 'Global Industries',
        rucCi: '20987654321',
        address: '456 Global Avenue',
        phone: '555-0456',
        email: 'info@globalind.com'
    }
];

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([
        {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'Tech Corp',
            subtotal: 1200.0,
            total: 1416.0,
            items: [
                {
                    id: '1',
                    productCode: 'P001',
                    barcode: '123456789',
                    description: 'Laptop Computer',
                    quantity: 1,
                    unitPrice: 999.99,
                    vat: 15,
                    subtotal: 999.99
                }
            ]
        },
        {
            id: '2',
            orderNumber: 'ORD-002',
            customer: 'Global Industries',
            subtotal: 850.0,
            total: 1003.0,
            items: []
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

    // Actualiza la lista de clientes filtrados según el término de búsqueda
    useEffect(() => {
        if (customerSearchTerm.length >= 3) {
            const filtered = mockCustomers.filter(customer =>
                customer.companyName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                customer.rucCi.includes(customerSearchTerm)
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    }, [customerSearchTerm]);

    const handleNewOrder = () => {
        setEditingOrder(null);
        setSelectedCustomer(null);
        setOrderItems([
            {
                id: '1',
                productCode: '',
                barcode: '',
                description: '',
                quantity: 1,
                unitPrice: 0,
                vat: 15,
                subtotal: 0
            }
        ]);
        setCustomerSearchTerm('');
        setIsModalOpen(true);
    };

    const handleEditOrder = (order: Order) => {
        Swal.fire({
            title: 'Confirmar edición',
            text: '¿Estás seguro de modificar este pedido?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, modificar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setEditingOrder(order);
                setOrderItems(
                    order.items && order.items.length > 0
                        ? order.items
                        : [
                            {
                                id: '1',
                                productCode: '',
                                barcode: '',
                                description: '',
                                quantity: 1,
                                unitPrice: 0,
                                vat: 15,
                                subtotal: 0
                            }
                        ]
                );
                const customer = mockCustomers.find(c => c.companyName === order.customer);
                if (customer) {
                    setSelectedCustomer(customer);
                    setCustomerSearchTerm(customer.companyName);
                }
                setIsModalOpen(true);
            }
        });
    };

    const handleDeleteOrder = (orderId: string) => {
        Swal.fire({
            title: 'Confirmar eliminación',
            text: '¿Estás seguro de eliminar este pedido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setOrders(orders.filter(order => order.id !== orderId));
                Swal.fire('Eliminado!', 'El pedido ha sido eliminado.', 'success');
            }
        });
    };

    // Validaciones: se verifica que se haya seleccionado un cliente y que cada ítem tenga un código de producto
    const handleSaveOrder = () => {
        if (!selectedCustomer) {
            Swal.fire('Error', 'Debe seleccionar un cliente.', 'error');
            return;
        }
        if (orderItems.length === 0 || orderItems.some(item => item.productCode.trim() === '')) {
            Swal.fire('Error', 'Debe agregar al menos un producto con código válido.', 'error');
            return;
        }

        const totals = calculateTotals(orderItems);

        if (editingOrder) {
            // Actualizar pedido
            const updatedOrder: Order = {
                ...editingOrder,
                customer: selectedCustomer.companyName,
                items: orderItems,
                subtotal: parseFloat(totals.subtotal),
                total: parseFloat(totals.total)
            };
            setOrders(orders.map(order => (order.id === editingOrder.id ? updatedOrder : order)));
            Swal.fire('Éxito', 'Pedido actualizado correctamente.', 'success');
        } else {
            // Crear nuevo pedido
            const newOrder: Order = {
                id: Date.now().toString(),
                orderNumber: `ORD-${(orders.length + 1).toString().padStart(3, '0')}`,
                customer: selectedCustomer.companyName,
                items: orderItems,
                subtotal: parseFloat(totals.subtotal),
                total: parseFloat(totals.total)
            };
            setOrders([...orders, newOrder]);
            Swal.fire('Éxito', 'Pedido creado correctamente.', 'success');
        }
        setIsModalOpen(false);
    };

    const handleAddItem = () => {
        const newItem: OrderItem = {
            id: Date.now().toString(),
            productCode: '',
            barcode: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            vat: 15,
            subtotal: 0
        };
        setOrderItems([...orderItems, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const handleUpdateItem = (id: string, field: keyof OrderItem, value: any) => {
        setOrderItems(
            orderItems.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Actualiza el subtotal según la cantidad y el precio unitario
                    updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const handleCustomerChange = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.companyName);
        setFilteredCustomers([]);
    };

    const handleCustomerSearch = (searchTerm: string) => {
        setCustomerSearchTerm(searchTerm);
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Lista de Pedidos</h1>
                <button className="btn btn-primary" onClick={handleNewOrder}>
                    Nuevo Pedido
                </button>
            </div>
            <OrderList
                orders={orders}
                onEditOrder={handleEditOrder}
                onDeleteOrder={handleDeleteOrder}
            />
            <OrderModal
                show={isModalOpen}
                editingOrder={editingOrder}
                selectedCustomer={selectedCustomer}
                orderItems={orderItems}
                totals={calculateTotals(orderItems)}
                onHide={() => setIsModalOpen(false)}
                onSave={handleSaveOrder}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onUpdateItem={handleUpdateItem}
                onCustomerChange={handleCustomerChange}
                onCustomerSearch={handleCustomerSearch}
                customerSearchTerm={customerSearchTerm}
                filteredCustomers={filteredCustomers}
            />
        </div>
    );
};

export default OrdersPage;
