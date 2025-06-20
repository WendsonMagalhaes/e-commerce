import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getCartItems,
    addCartItem,
    removeCartItem,
    updateCartItemQty,
    selectCartItem
} from '../services/cart';
import { useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const hasSyncedCart = useRef(false);
    const [items, setItems] = useState(() => {
        const json = localStorage.getItem('cart');
        return json ? JSON.parse(json) : [];
    });

    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const checkToken = () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken !== token) {
                setToken(storedToken);
            }
        };

        const interval = setInterval(checkToken, 1000);

        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        let canceled = false;

        async function syncCart() {
            if (token && !hasSyncedCart.current) {
                hasSyncedCart.current = true;

                try {
                    const localCart = JSON.parse(localStorage.getItem('cart')) || [];

                    if (localCart.length > 0) {
                        const promises = localCart.map(async ({ productId, productProvider, quantity }) => {
                            try {
                                await addCartItem({ productId, productProvider, quantity });
                            } catch (err) {
                                if (err.response?.status === 404) {
                                    console.warn('Produto não encontrado ao sincronizar. Limpando carrinho local.');
                                    localStorage.removeItem('cart');
                                } else {
                                    throw err;
                                }
                            }
                        });

                        await Promise.all(promises);
                        if (!canceled) setItems([]);
                        localStorage.removeItem('cart'); // limpa mesmo com sucesso
                    }

                    if (!canceled) {
                        const { data } = await getCartItems();
                        setItems(data.items || []);
                    }
                } catch (err) {
                    if (!canceled) console.error('Erro ao sincronizar carrinho:', err);
                }
            }
        }

        syncCart();

        return () => {
            canceled = true;
        };
    }, [token]);


    const addToCart = ({ productId, productProvider, quantity }) => {
        if (token) {
            addCartItem({ productId, productProvider, quantity });
        } else {
            setItems(prev => {
                const found = prev.find(i => i.productId === productId && i.productProvider === productProvider);
                if (found) {
                    return prev.map(i =>
                        i.productId === productId && i.productProvider === productProvider
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    );
                }
                return [...prev, { productId, productProvider, quantity, selected: true }];
            });
        }
    };

    const updateQuantity = (itemId, quantity) => {
        if (token) {
            updateCartItemQty(itemId, quantity).then(() => getCartItems());
        } else {
            setItems(prev =>
                prev.map(i => (i.productId === itemId ? { ...i, quantity } : i))
            );
        }
    };

    const selectItem = (itemId, selected) => {
        if (token) {
            selectCartItem(itemId, selected).then(() => getCartItems());
        } else {
            setItems(prev =>
                prev.map(i =>
                    i.productId === itemId ? { ...i, selected } : i
                )
            );
        }
    };

    const removeFromCart = (itemId) => {
        if (token) {
            removeCartItem(itemId).then(() => getCartItems());
        } else {
            setItems(prev =>
                prev.filter(i => i.productId !== itemId)
            );
        }
    };

    const getCart = async () => {
        if (token) {
            const { data } = await getCartItems();
            return data.items || [];
        }
        return items;
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart');
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            updateQuantity,
            selectItem,
            removeFromCart,
            clearCart,
            getCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
}
