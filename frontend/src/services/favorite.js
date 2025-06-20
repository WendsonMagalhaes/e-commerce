import api from "./api";

export const getFavorites = () => api.get('/favorites');

export const addFavorite = (body) => api.post('/favorites', body);

export const removeFavorite = (productId, provider) =>
    api.delete(`/favorites/${productId}/${provider}`);


