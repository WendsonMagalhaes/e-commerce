import api from "./api";

export const getCartItems = () => api.get('/cart');

export const addCartItem = ({ productId, productProvider, quantity }) =>
    api.post('/cart/add', { productId, productProvider, quantity });

export const updateCartItemQty = (itemId, quantity) =>
    api.patch(`/cart/item/${itemId}`, { quantity });

export const selectCartItem = (itemId, selected) =>
    api.patch(`/cart/item/${itemId}/select`, { selected });

export const removeCartItem = (itemId) =>
    api.delete(`/cart/item/${itemId}`);