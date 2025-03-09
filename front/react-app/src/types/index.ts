// src/types/index.ts
export interface Order {
    id: string;
    orderNumber: string;
    customer: string;
    customerId?: string;
    items?: OrderItem[];
    subtotal: number;
    total: number;
}

export interface Customer {
    companyName: string;
    rucCi: string;
    address: string;
    phone: string;
    email: string;
}

export interface Product {
    code: string;
    barcode: string;
    description: string;
    price: number;
}

export interface OrderItem {
    id: string;
    productCode: string;
    barcode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vat: number;
    subtotal: number;
}
