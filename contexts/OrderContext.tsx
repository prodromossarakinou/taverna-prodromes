'use client';

import React, {createContext, useContext, useState, ReactNode, useCallback, useEffect} from 'react';
import {Order, ItemStatus, MenuItem, OrderStatus} from '../types/order';

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<void>;
    updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
    setOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    completeOrder: (orderId: string) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;
    updateItemStatus: (orderId: string, itemId: string) => Promise<void>;
    setItemStatus: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
    updateItemUnitStatus: (orderId: string, unitId: string, status: ItemStatus) => Promise<void>;
    setItemUnitStatus: (orderId: string, unitId: string, status: ItemStatus) => Promise<void>;
    setItemUnitsStatus: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
    refreshOrders: () => Promise<void>;
    menuItems: MenuItem[];
    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateMenuItem: (id: string, item: Omit<MenuItem, 'id'>) => Promise<void>;
    deleteMenuItem: (id: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({children}: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            const uniqueOrders = Array.from(
                new Map((data as Order[]).map(order => [order.id, order])).values()
            );
            setOrders(prev => {
                if (prev.length === uniqueOrders.length) {
                    const isSame = prev.every((order, index) => {
                        const nextOrder = uniqueOrders[index];
                        if (!nextOrder) return false;
                        if (order.id !== nextOrder.id) return false;
                        if (order.timestamp !== nextOrder.timestamp) return false;
                        if (order.status !== nextOrder.status) return false;
                        if (order.items.length !== nextOrder.items.length) return false;
                        return order.items.every((item, itemIndex) => {
                            const nextItem = nextOrder.items[itemIndex];
                            return nextItem
                                ? item.id === nextItem.id && item.itemStatus === nextItem.itemStatus
                                : false;
                        });
                    });
                    if (isSame) return prev;
                }
                return uniqueOrders;
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }, []);

    const fetchMenuItems = useCallback(async () => {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Failed to fetch menu');
            const data = await response.json();
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    }, []);

    useEffect(() => {
        void fetchOrders();
        void fetchMenuItems();
    }, [fetchOrders, fetchMenuItems]);

    const addOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (!response.ok) throw new Error('Failed to create order');
            await fetchOrders();
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const updateOrder = async (orderId: string, updates: Partial<Order>) => {
        if (!updates.status) return;
        await setOrderStatus(orderId, updates.status);
    };

    const setOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderStatus: status }),
            });
            if (!response.ok) throw new Error('Failed to update order');
            await fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const completeOrder = async (orderId: string) => {
        await updateOrder(orderId, { status: 'completed' });
    };

    const deleteOrder = async (orderId: string) => {
        await updateOrder(orderId, { status: 'cancelled' });
    };

    const updateItemStatus = async (orderId: string, itemId: string) => {
        const order = orders.find(currentOrder => currentOrder.id === orderId);
        const item = order?.items.find(orderItem => orderItem.id === itemId);
        const statuses: ItemStatus[] = ['pending', 'ready', 'delivered'];
        const currentIndex = statuses.indexOf(item?.itemStatus || 'pending');
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        await setItemStatus(orderId, itemId, nextStatus);
    };

    const setItemStatus = async (orderId: string, itemId: string, status: ItemStatus) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, itemStatus: status }),
            });
            if (!response.ok) throw new Error('Failed to update item status');
            await fetchOrders();
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    const updateItemUnitStatus = async (orderId: string, unitId: string, status: ItemStatus) => {
        const statuses: ItemStatus[] = ['pending', 'ready', 'delivered'];
        const currentIndex = statuses.indexOf(status || 'pending');
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        await setItemUnitStatus(orderId, unitId, nextStatus);
    };

    const setItemUnitStatus = async (orderId: string, unitId: string, status: ItemStatus) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unitId, unitStatus: status }),
            });
            if (!response.ok) throw new Error('Failed to update item unit status');
            await fetchOrders();
        } catch (error) {
            console.error('Error updating item unit status:', error);
        }
    };

    const setItemUnitsStatus = async (orderId: string, itemId: string, status: ItemStatus) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, unitStatus: status, mode: 'bulk' }),
            });
            if (!response.ok) throw new Error('Failed to update item units status');
            await fetchOrders();
        } catch (error) {
            console.error('Error updating item units status:', error);
        }
    };

    const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
        try {
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error('Failed to create menu item');
            await fetchMenuItems();
        } catch (error) {
            console.error('Error creating menu item:', error);
        }
    };

    const updateMenuItem = async (id: string, item: Omit<MenuItem, 'id'>) => {
        try {
            const response = await fetch(`/api/menu/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error('Failed to update menu item');
            await fetchMenuItems();
        } catch (error) {
            console.error('Error updating menu item:', error);
        }
    };

    const deleteMenuItem = async (id: string) => {
        try {
            const response = await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete menu item');
            await fetchMenuItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    return (
        <OrderContext.Provider value={{
            orders,
            addOrder,
            updateOrder,
            completeOrder,
            deleteOrder,
            updateItemStatus,
            setItemStatus,
            updateItemUnitStatus,
            setItemUnitStatus,
            setItemUnitsStatus,
            refreshOrders: fetchOrders,
            setOrderStatus,
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
