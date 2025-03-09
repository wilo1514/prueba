// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import OrderList from '../components/OrderList';
import OrderModal from '../components/OrderModal';
import { Order, OrderItem, Customer } from '../types';
import { calculateTotals } from '../utils/calculations';

// Función para transformar un invoice del backend a un Order
function transformInvoiceToOrder(invoice: any): Order {
    return {
        id: invoice._id,
        orderNumber: `ORD-${invoice._id.substring(0, 6)}`, // Ajusta la lógica según convenga
        customer: invoice.Cliente?.razonSocial || 'Sin Cliente',
        subtotal: invoice.detalles.reduce((acc: number, d: any) => acc + d.subtotal, 0),
        total: invoice.total,
        items: invoice.detalles.map((det: any) => ({
            id: det._id || '',
            productCode: det.codigoProducto,
            barcode: det.codigoBarras,
            description: det.descripcion,
            quantity: det.cantidad,
            unitPrice: det.precioUnitario,
            vat: det.impuestos && det.impuestos.length ? parseInt(det.impuestos[0].percentage) : 0,
            subtotal: det.subtotal,
        })),
    };
}

// Función para transformar un cliente del backend a Customer
function transformClientToCustomer(client: any): Customer {
    return {
        companyName: client.razonSocial,
        rucCi: client.identificacion,
        address: client.direccion,
        phone: client.telefono,
        email: client.email,
    };
}

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

    // Al montar, obtener pedidos y clientes reales
    useEffect(() => {
        fetchOrders();
        fetchCustomers();
    }, []);

    // Filtrar clientes en base al término de búsqueda
    useEffect(() => {
        if (customerSearchTerm.length >= 3) {
            const filtered = allCustomers.filter((c) =>
                c.companyName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                c.rucCi.includes(customerSearchTerm)
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    }, [customerSearchTerm, allCustomers]);

    // Obtener pedidos (invoices) desde la API Gateway
    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/invoices');
            const transformed = response.data.map((inv: any) =>
                transformInvoiceToOrder(inv)
            );
            setOrders(transformed);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo obtener la lista de pedidos', 'error');
        }
    };

    // Obtener clientes desde la API Gateway
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/clients');
            const transformed = response.data.map((cli: any) =>
                transformClientToCustomer(cli)
            );
            setAllCustomers(transformed);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo obtener la lista de clientes', 'error');
        }
    };

    // Nuevo pedido
    const handleNewOrder = () => {
        setEditingOrder(null);
        setSelectedCustomer(null);
        setOrderItems([
            {
                id: `temp-${Date.now()}`,
                productCode: '',
                barcode: '',
                description: '',
                quantity: 1,
                unitPrice: 0,
                vat: 15,
                subtotal: 0,
            },
        ]);
        setCustomerSearchTerm('');
        setIsModalOpen(true);
    };

    // Editar pedido
    const handleEditOrder = (order: Order) => {
        Swal.fire({
            title: 'Confirmar edición',
            text: '¿Estás seguro de modificar este pedido?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, modificar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                setEditingOrder(order);
                setOrderItems(order.items || []);
                // Buscamos el cliente entre los clientes obtenidos; si no se encuentra, se usa un objeto vacío
                const found = allCustomers.find(
                    (c) => c.companyName === order.customer
                );
                setSelectedCustomer(found || null);
                setCustomerSearchTerm(order.customer);
                setIsModalOpen(true);
            }
        });
    };

    // Eliminar pedido
    const handleDeleteOrder = (orderId: string) => {
        Swal.fire({
            title: 'Confirmar eliminación',
            text: '¿Estás seguro de eliminar este pedido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:4000/api/invoices/${orderId}`);
                    Swal.fire('Eliminado!', 'El pedido ha sido eliminado.', 'success');
                    fetchOrders();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
                }
            }
        });
    };

    // Guardar (crear o actualizar) pedido
    const handleSaveOrder = async () => {
        if (!selectedCustomer) {
            Swal.fire('Error', 'Debe seleccionar un cliente.', 'error');
            return;
        }
        if (orderItems.length === 0 || orderItems.some((item) => item.productCode.trim() === '')) {
            Swal.fire('Error', 'Debe agregar al menos un producto con código válido.', 'error');
            return;
        }

        const totals = calculateTotals(orderItems);

        // Construir el payload según lo que espera el backend
        const invoicePayload = {
            Cliente: {
                razonSocial: selectedCustomer.companyName,
                identificacion: selectedCustomer.rucCi,
                direccion: selectedCustomer.address,
                telefono: selectedCustomer.phone,
                email: selectedCustomer.email,
            },
            detalles: orderItems.map((item) => ({
                codigoProducto: item.productCode,
                codigoBarras: item.barcode,
                descripcion: item.description,
                cantidad: item.quantity,
                precioUnitario: item.unitPrice,
                impuestos: [
                    {
                        IVA: true,
                        percentage: item.vat.toString(),
                    },
                ],
                subtotal: item.subtotal,
            })),
            total: parseFloat(totals.total),
        };

        if (editingOrder) {
            // Actualizar pedido
            try {
                await axios.put(`http://localhost:4000/api/invoices/${editingOrder.id}`, invoicePayload);
                Swal.fire('Éxito', 'Pedido actualizado correctamente.', 'success');
                fetchOrders();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo actualizar el pedido', 'error');
            }
        } else {
            // Crear pedido
            try {
                await axios.post(`http://localhost:4000/api/invoices`, invoicePayload);
                Swal.fire('Éxito', 'Pedido creado correctamente.', 'success');
                fetchOrders();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo crear el pedido', 'error');
            }
        }
        setIsModalOpen(false);
    };

    // Agregar ítem al pedido
    const handleAddItem = () => {
        const newItem: OrderItem = {
            id: Date.now().toString(),
            productCode: '',
            barcode: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            vat: 15,
            subtotal: 0,
        };
        setOrderItems([...orderItems, newItem]);
    };

    // Eliminar ítem del pedido
    const handleRemoveItem = (id: string) => {
        setOrderItems(orderItems.filter((item) => item.id !== id));
    };

    // Actualizar ítem del pedido
    const handleUpdateItem = (id: string, field: keyof OrderItem, value: any) => {
        setOrderItems(
            orderItems.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
                    return updatedItem;
                }
                return item;
            })
        );
    };

    // Seleccionar un cliente de la lista filtrada
    const handleCustomerChange = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.companyName);
        setFilteredCustomers([]);
    };

    // Actualizar término de búsqueda de clientes
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
