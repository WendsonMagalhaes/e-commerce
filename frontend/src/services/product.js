import api from "./api";

export const getProducts = (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/products/search?${params.toString()}`);
};

export const getProductById = (provider, id) =>
    api.get(`/products/${provider}/${id}`);

export const getProductUnifiedById = (provider, id) =>
    api.get(`/products/unified/${provider}/${id}`);
