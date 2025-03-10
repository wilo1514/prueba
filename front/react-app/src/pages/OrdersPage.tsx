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
    const [originalOrderItems, setOriginalOrderItems] = useState<OrderItem[]>([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
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

    // Nuevo pedido: sin productos por defecto
    const handleNewOrder = () => {
        setEditingOrder(null);
        setSelectedCustomer(null);
        setOrderItems([]);
        setOriginalOrderItems([]);
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
                setOriginalOrderItems(order.items ? order.items.map((i) => ({ ...i })) : []);
                const found = allCustomers.find((c) => c.companyName === order.customer);
                setSelectedCustomer(found || null);
                setCustomerSearchTerm(order.customer);
                setIsModalOpen(true);
            }
        });
    };

    // Eliminar pedido: devolver stock
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
                const orderToDelete = orders.find((o) => o.id === orderId);
                if (orderToDelete) {
                    // Regresamos el stock
                    for (const item of orderToDelete.items) {
                        try {
                            await updateProductStock(item.productCode, item.quantity, 0);
                        } catch (error) {
                            console.error(`Error actualizando stock al eliminar pedido:`, error);
                        }
                    }
                }
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

    // Autocompletado al seleccionar un producto
    const handleProductSelect = (orderItemId: string, product: Product) => {
        // Verificar si ya existe en otra fila
        const normalizedCode = product.code.trim().toLowerCase();
        const existsInOtherRow = orderItems.some((item) => {
            if (item.id === orderItemId) return false; // Ignorar la fila actual
            return item.productCode.trim().toLowerCase() === normalizedCode;
        });
        if (existsInOtherRow) {
            Swal.fire('Error', 'El producto ya está agregado en el pedido.', 'error');
            return;
        }

        // Autocompletar la fila actual
        handleUpdateItem(orderItemId, 'productCode', product.code.trim());
        handleUpdateItem(orderItemId, 'barcode', product.barcode.trim());
        handleUpdateItem(orderItemId, 'description', product.description.trim());
        handleUpdateItem(orderItemId, 'unitPrice', product.price);
        // Si deseas forzar un IVA por defecto:
        // handleUpdateItem(orderItemId, 'vat', 15);
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

        // Validar stock
        for (const item of orderItems) {
            const prod = allProducts.find((p) => p.code === item.productCode);
            if (!prod) {
                Swal.fire('Error', `El producto con código ${item.productCode} no se encontró.`, 'error');
                return;
            }
            let availableStock = prod.stock;
            if (editingOrder) {
                const origItem = originalOrderItems.find((i) => i.id === item.id);
                const origQty = origItem ? origItem.quantity : 0;
                availableStock += origQty;
            }
            if (item.quantity > availableStock) {
                Swal.fire(
                    'Error',
                    `El producto ${prod.code} (${prod.description}) tiene stock insuficiente. Disponible: ${availableStock}`,
                    'error'
                );
                return;
            }
        }

        const totals = calculateTotals(orderItems);

        // Construir payload
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

        // Actualizar stock
        if (editingOrder) {
            // Para productos eliminados
            for (const origItem of originalOrderItems) {
                const exists = orderItems.find((i) => i.id === origItem.id);
                if (!exists) {
                    try {
                        await updateProductStock(origItem.productCode, origItem.quantity, 0);
                    } catch (error) {
                        console.error(`Error actualizando stock para ${origItem.productCode}:`, error);
                    }
                }
            }
            // Para productos que se mantienen o se agregan
            for (const item of orderItems) {
                const origItem = originalOrderItems.find((i) => i.id === item.id);
                const oldQuantity = origItem ? origItem.quantity : 0;
                try {
                    await updateProductStock(item.productCode, oldQuantity, item.quantity);
                } catch (error) {
                    console.error(`Error actualizando stock para ${item.productCode}:`, error);
                }
            }
        } else {
            // Pedido nuevo
            for (const item of orderItems) {
                try {
                    await updateProductStock(item.productCode, 0, item.quantity);
                } catch (error) {
                    console.error(`Error actualizando stock para ${item.productCode}:`, error);
                }
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
            quantity: 0,
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
        setOrderItems((prevItems) =>
            prevItems.map((item) => {
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
                allProducts={allProducts}
                onProductSelect={handleProductSelect}
            />
        </div>
    );
};

export default OrdersPage;
