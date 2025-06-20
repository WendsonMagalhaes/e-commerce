import api from "./api";

export const finalizePurchase = (payload) =>
    api.post('/sales/finalize', payload);

export const getPurchaseHistory = () =>
    api.get('/sales');