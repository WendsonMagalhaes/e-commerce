import React, { useState, useEffect } from 'react';
import './Favorites.css';
import Header from '../../components/Header/Header';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../../context/FavoriteContext';
import SpinnerLoading from '../../components/SpinnerLoading/SpinnerLoading';


const Favorites = () => {
    const [modalProduct, setModalProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { t, i18n } = useTranslation();
    const { favorites } = useFavorites();
    const [loading, setLoading] = useState(true);

    const openModal = (product) => {
        setModalProduct(product);
        setQuantity(1);
    };

    const closeModal = () => {
        setModalProduct(null);
    };

    const handleAdd = () => {
        if (!modalProduct) return;
        addToCart({
            productId: modalProduct.id,
            productProvider: modalProduct.provider,
            quantity,
        });
        closeModal();
    };


    useEffect(() => {
        if (favorites.length > 0 || favorites.length === 0) {
            setLoading(false);
        }
    }, [favorites]);

    const validFavorites = favorites.filter(p => p && p.price !== undefined && p.name);

    return (
        <div className='favorites'>
            <Header />
            <div className='favorites-container'>
                <div className='favorites-content'>
                    {loading ? (
                        <div className='spinner-loading-overlay'>
                            <SpinnerLoading />
                        </div>) : validFavorites.length === 0 ? (
                            <h2 style={{ marginLeft: '20px', fontWeight: 'bold' }}>{t('Você ainda não adicionou nenhum produto aos favoritos.')}</h2>

                        ) : (
                        <div className='favorites-grid'>
                            {validFavorites.map((product) => (
                                <ProductCard
                                    key={`${product.id}-${product.provider}`}
                                    product={product}
                                    onOpenModal={openModal}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {modalProduct && modalProduct.price !== undefined && (
                <div className='modal-overlay' onClick={closeModal}>
                    <div className='product-modal' onClick={(e) => e.stopPropagation()}>
                        <button className='close-modal' onClick={closeModal}>×</button>
                        <div className='modal-content'>
                            <div className='modal-image'>
                                <img src={modalProduct.gallery?.[0]} alt='Product' />
                            </div>
                            <div className='modal-details'>
                                <h2 className='modal-name'>{t(`names.${modalProduct.name}`)}</h2>
                                <div className='price-section'>
                                    <span className='modal-price'>
                                        {t('R$')} {i18n.language === 'pt'
                                            ? modalProduct.price.toString().replace('.', ',')
                                            : modalProduct.price.toString()}
                                    </span>
                                </div>
                                <p className='modal-description'>{t(`descriptions.${modalProduct.description}`)}</p>
                                <div className='technical-info'>
                                    <p><strong>{t('Categoria')}:</strong> {modalProduct.category}</p>
                                    <p><strong>{t('Departamento')}:</strong> {modalProduct.department}</p>
                                    <p><strong>{t('Material')}:</strong> {modalProduct.material}</p>
                                </div>
                                <div className='modal-button'>
                                    <div className='quantity-section'>
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                    </div>
                                    <button className='add-to-cart' onClick={handleAdd}>
                                        {t('Adicionar ao Carrinho')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
