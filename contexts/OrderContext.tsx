'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Order, OrderItem, ItemStatus, MenuItem} from '../types/order';

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    completeOrder: (orderId: string) => void;
    deleteOrder: (orderId: string) => void;
    updateItemStatus: (orderId: string, itemId: string) => void;
    menuItems: MenuItem[];
    addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
    updateMenuItem: (id: string, item: Omit<MenuItem, 'id'>) => void;
    deleteMenuItem: (id: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const DUMMY_ORDERS: Order[] = [];
const DUMMY_MENU_ITEMS: MenuItem[] = [
    { id: '1', name: 'Χωριάτικη Σαλάτα', category: 'Κρύα', price: 6.5, active: true },
    { id: '2', name: 'Πράσινη Σαλάτα', category: 'Κρύα', price: 5.5, active: true },
    { id: '3', name: 'Ρόκα με Παρμεζάνα', category: 'Κρύα', price: 7.2, active: true },
    { id: '4', name: 'Καίσαρ', category: 'Κρύα', price: 7.8, active: true },
    { id: '5', name: 'Ντοματοσαλάτα', category: 'Κρύα', price: 4.8, active: true },
    { id: '6', name: 'Ζεστή Σαλάτα με Κοτόπουλο', category: 'Ζεστές', price: 8.4, active: true },
    { id: '7', name: 'Σαλάτα με Γαρίδες', category: 'Ζεστές', price: 9.9, active: true },
    { id: '8', name: 'Μπριζόλα Χοιρινή', category: 'Ψησταριά', price: 10.5, active: true },
    { id: '9', name: 'Μπριζόλα Μοσχαρίσια', category: 'Ψησταριά', price: 13.5, active: true },
    { id: '10', name: 'Κοτόπουλο Φιλέτο', category: 'Ψησταριά', price: 9.2, active: true },
    { id: '11', name: 'Μπιφτέκι', category: 'Ψησταριά', price: 7.9, active: true },
    { id: '12', name: 'Σουβλάκι Χοιρινό', category: 'Ψησταριά', price: 6.4, active: true },
    { id: '13', name: 'Σουβλάκι Κοτόπουλο', category: 'Ψησταριά', price: 6.8, active: true },
    { id: '14', name: 'Μουσακάς', category: 'Μαγειρευτό', price: 9.5, active: true },
    { id: '15', name: 'Παστίτσιο', category: 'Μαγειρευτό', price: 9.2, active: true },
    { id: '16', name: 'Παπουτσάκια', category: 'Μαγειρευτό', price: 8.7, active: true },
    { id: '17', name: 'Γιουβέτσι', category: 'Μαγειρευτό', price: 10.2, active: true },
    { id: '18', name: 'Κοκκινιστό', category: 'Μαγειρευτό', price: 10.6, active: true },
    { id: '19', name: 'Κόκα Κόλα', category: 'Ποτά', price: 2.2, active: true },
    { id: '20', name: 'Σπράιτ', category: 'Ποτά', price: 2.2, active: true },
    { id: '21', name: 'Φάντα', category: 'Ποτά', price: 2.2, active: true },
    { id: '22', name: 'Νερό', category: 'Ποτά', price: 1.5, active: true },
    { id: '23', name: 'Μπύρα', category: 'Ποτά', price: 3.5, active: true },
    { id: '24', name: 'Κρασί Λευκό', category: 'Ποτά', price: 4.5, active: true },
    { id: '25', name: 'Κρασί Κόκκινο', category: 'Ποτά', price: 4.8, active: true },
    { id: '26', name: 'Καφές', category: 'Ποτά', price: 2.0, active: true },
];

export function OrderProvider({children}: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);
    const [menuItems, setMenuItems] = useState<MenuItem[]>(DUMMY_MENU_ITEMS);

    const addOrder = (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
        const newOrder: Order = {
            ...orderData,
            id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            status: 'pending',
            isExtra: (orderData as any).isExtra || false,
            parentId: (orderData as any).parentId,
        };
        setOrders(prev => [...prev, newOrder]);
    };

    const updateOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId ? { ...order, ...updates } : order
            )
        );
    };

    const completeOrder = (orderId: string) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId ? {...order, status: 'completed'} : order
            )
        );
    };

    const deleteOrder = (orderId: string) => {
        setOrders(prev => prev.filter(order => order.id !== orderId));
    };

    const updateItemStatus = (orderId: string, itemId: string) => {
        setOrders(prev =>
            prev.map(order => {
                if (order.id !== orderId) return order;
                return {
                    ...order,
                    items: order.items.map(item => {
                        if (item.id !== itemId) return item;

                        const statuses: ItemStatus[] = ['pending', 'ready', 'delivered'];
                        const currentIndex = statuses.indexOf(item.itemStatus || 'pending');
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

                        return {...item, itemStatus: nextStatus};
                    }),
                };
            })
        );
    };

    const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
        const newItem: MenuItem = {
            ...item,
            id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        setMenuItems(prev => [...prev, newItem]);
    };

    const updateMenuItem = (id: string, item: Omit<MenuItem, 'id'>) => {
        setMenuItems(prev =>
            prev.map(menuItem => (menuItem.id === id ? { ...menuItem, ...item } : menuItem))
        );
    };

    const deleteMenuItem = (id: string) => {
        setMenuItems(prev => prev.filter(menuItem => menuItem.id !== id));
    };

    return (
        <OrderContext.Provider value={{
            orders,
            addOrder,
            updateOrder,
            completeOrder,
            deleteOrder,
            updateItemStatus,
            menuItems,
            addMenuItem,
            updateMenuItem,
            deleteMenuItem,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within OrderProvider');
    }
    return context;
}
