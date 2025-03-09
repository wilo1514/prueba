// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import OrderList from '../components/OrderList';
import OrderModal from '../components/OrderModal';
import { Order, OrderItem, Customer, Product } from '../types';
import { calculateTotals } from '../utils/calculations';
import { getProducts, updateProductStock } from '../services/productService';

// Transforma un invoice del backend a un Order
function transformInvoiceToOrder(invoice: any): Order {
    return {
        id: invoice._id,
        orderNumber: `ORD-${invoice._id.substring(0, 6)}`,
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

// Transforma un cliente del backend a Customer (incluye id)
function transformClientToCustomer(client: any): Customer {
    return {
        id: client._id,
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

    // Estado para productos (se usa la lista completa en OrderModal para búsquedas en cada campo)
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchOrders();
        fetchCustomers();
        fetchAllProducts();
    }, []);

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

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/invoices');
            const transformed = response.data.map((inv: any) => transformInvoiceToOrder(inv));
            setOrders(transformed);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo obtener la lista de pedidos', 'error');
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/clients');
            const transformed = response.data.map((cli: any) => transformClientToCustomer(cli));
            setAllCustomers(transformed);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo obtener la lista de clientes', 'error');
        }
    };

    const fetchAllProducts = async () => {
        try {
            const products = await getProducts();
            console.log('All products fetched:', products);
            setAllProducts(products);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCustomerChange = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.companyName);
        setFilteredCustomers([]);
    };

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
                const found = allCustomers.find((c) => c.companyName === order.customer);
                setSelectedCustomer(found || null);
                setCustomerSearchTerm(order.customer);
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

    // Función para manejar la selección de un producto
    const handleProductSelect = (orderItemId: string, product: Product) => {
        // Evitar duplicados: verificar si ya existe el producto en otro ítem
        const exists = orderItems.some((item) => item.productCode === product.code);
        if (exists) {
            Swal.fire('Error', 'El producto ya está agregado en el pedido.', 'error');
            return;
        }
        // Actualizar campos del ítem con la información del producto seleccionado
        handleUpdateItem(orderItemId, 'productCode', product.code);
        handleUpdateItem(orderItemId, 'barcode', product.barcode);
        handleUpdateItem(orderItemId, 'description', product.description);
        handleUpdateItem(orderItemId, 'unitPrice', product.price);
    };

    const handleSaveOrder = async () => {
        if (!selectedCustomer) {
            Swal.fire('Error', 'Debe seleccionar un cliente.', 'error');
            return;
        }
        if (orderItems.length === 0 || orderItems.some((item) => item.productCode.trim() === '')) {
            Swal.fire('Error', 'Debe agregar al menos un producto con código válido.', 'error');
            return;
        }

        // Validar stock para cada ítem
        for (const item of orderItems) {
            const prod = allProducts.find((p) => p.code === item.productCode);
            if (!prod) {
                Swal.fire('Error', `El producto con código ${item.productCode} no se encontró.`, 'error');
                return;
            }
            if (prod.stock < item.quantity) {
                Swal.fire('Error', `El producto ${prod.code} (${prod.description}) tiene stock insuficiente.`, 'error');
                return;
            }
        }

        const totals = calculateTotals(orderItems);

        // Construir payload con la estructura requerida
        const payload = {
            clienteId: selectedCustomer.id,
            detalles: orderItems.map((item) => ({
                codigoProducto: item.productCode,
                cantidad: item.quantity,
                percentage: item.vat,
            })),
        };

        try {
            if (editingOrder) {
                await axios.put(`http://localhost:4000/api/invoices/${editingOrder.id}`, payload);
                Swal.fire('Éxito', 'Pedido actualizado correctamente.', 'success');
            } else {
                await axios.post(`http://localhost:4000/api/invoices`, payload);
                Swal.fire('Éxito', 'Pedido creado correctamente.', 'success');
            }
            fetchOrders();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el pedido', 'error');
            return;
        }

        // Actualizar stock para cada producto (restar la cantidad ordenada)
        for (const item of orderItems) {
            try {
                await updateProductStock(item.productCode, item.quantity);
            } catch (error) {
                console.error(`Error actualizando stock para ${item.productCode}:`, error);
            }
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
            subtotal: 0,
        };
        setOrderItems([...orderItems, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setOrderItems(orderItems.filter((item) => item.id !== id));
    };

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
                onCustomerSearch={setCustomerSearchTerm}
                customerSearchTerm={customerSearchTerm}
                filteredCustomers={filteredCustomers}
                // Para la búsqueda de productos, se pasa la lista completa
                allProducts={allProducts}
                onProductSelect={handleProductSelect}
            />
        </div>
    );
};

export default OrdersPage;
