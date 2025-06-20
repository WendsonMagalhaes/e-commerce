import React, { createContext, useContext, useEffect, useState } from 'react';
import { addFavorite, getFavorites, removeFavorite as removeFavoriteAPI } from '../services/favorite';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const localKey = 'anon_favorites';

    useEffect(() => {
        const checkToken = () => {
            const stored = localStorage.getItem('token');
            if (stored !== token) {
                setToken(stored);
            }
        };
        const interval = setInterval(checkToken, 1000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        const loadFavorites = async () => {
            if (token) {
                const localFavorites = JSON.parse(localStorage.getItem(localKey) || '[]');
                if (localFavorites.length > 0) {
                    try {
                        await Promise.all(
                            localFavorites.map(product =>
                                addFavorite({ productId: product.id, provider: product.provider }).catch(err => {
                                    console.warn('Erro ao adicionar favorito local:', err);
                                })
                            )
                        );
                    } catch (e) {
                    }
                    localStorage.removeItem(localKey);
                }

                try {
                    const { data } = await getFavorites();
                    const products = data
                        .filter(fav => fav.product)
                        .map(fav => ({ ...fav.product, isFavorited: true }));
                    setFavorites(products);
                } catch (err) {
                    console.error('Erro ao carregar favoritos da API:', err);
                    setFavorites([]); // fallback para vazio
                }
            } else {
                const stored = JSON.parse(localStorage.getItem(localKey) || '[]');
                const filtered = stored.filter(p => p && p.price !== undefined && p.name);
                setFavorites(filtered.map(p => ({ ...p, isFavorited: true })));
            }
        };

        loadFavorites();
    }, [token]);

    const isFavorited = (productId, provider) =>
        favorites.some(p => p.id === productId && p.provider === provider);

    const add = async (product) => {
        if (isFavorited(product.id, product.provider)) return;

        const updated = [...favorites, { ...product, isFavorited: true }];

        setFavorites(updated);

        if (token) {
            try {
                await addFavorite({ productId: product.id, provider: product.provider });
            } catch (err) {
                console.error('Erro ao adicionar favorito API:', err);
            }
        } else {
            localStorage.setItem(localKey, JSON.stringify(updated));
        }
    };

    const remove = async (productId, provider) => {
        const updated = favorites.filter(p => !(p.id === productId && p.provider === provider));

        setFavorites(updated);

        if (token) {
            try {
                await removeFavoriteAPI(productId, provider);
            } catch (err) {
                console.error('Erro ao remover favorito API:', err);
            }
        } else {
            localStorage.setItem(localKey, JSON.stringify(updated));
        }
    };

    return (
        <FavoriteContext.Provider value={{ favorites, isFavorited, add, remove }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoriteContext);
