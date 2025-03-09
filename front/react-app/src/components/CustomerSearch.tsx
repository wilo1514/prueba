// src/components/CustomerSearch.tsx
import React from 'react';
import { Form } from 'react-bootstrap';
import { Customer } from '../types';

interface CustomerSearchProps {
    searchTerm: string;
    filteredCustomers: Customer[];
    onSearchChange: (value: string) => void;
    onSelectCustomer: (customer: Customer) => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
    searchTerm,
    filteredCustomers,
    onSearchChange,
    onSelectCustomer,
}) => {
    return (
        <div className="mb-3">
            <Form.Group controlId="customerSearch">
                <Form.Label>Buscar Cliente</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </Form.Group>
            {searchTerm.length >= 3 && filteredCustomers.length > 0 && (
                <div
                    className="border border-secondary mt-1"
                    style={{ maxHeight: '150px', overflowY: 'auto' }}
                >
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.rucCi}
                            className="p-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onSelectCustomer(customer)}
                        >
                            <strong>{customer.companyName}</strong> - {customer.rucCi}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerSearch;
