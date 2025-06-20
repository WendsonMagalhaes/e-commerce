import api from "./api";

export const login = (creds) =>
    api.post('/auth/login', creds);

export const register = (userData) =>
    api.post('/auth/register', userData);