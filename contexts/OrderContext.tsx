'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Order, OrderItem, ItemStatus} from '../types/order';

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    completeOrder: (orderId: string) => void;
    deleteOrder: (orderId: string) => void;
    updateItemStatus: (orderId: string, itemId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const DUMMY_ORDERS: Order[] = [];

export function OrderProvider({children}: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);

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

    return (
        <OrderContext.Provider value={{orders, addOrder, updateOrder, completeOrder, deleteOrder, updateItemStatus}}>
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
