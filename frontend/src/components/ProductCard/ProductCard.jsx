import React from 'react';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid, faCartShopping, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoriteContext';

const ProductCard = ({ product, onOpenModal }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isFavorited, add, remove } = useFavorites();
    const isPortuguese = i18n.language === 'pt';

    const favorited = isFavorited(product.id, product.provider);

    const toggleFavorite = () => {
        if (favorited) {
            remove(product.id, product.provider);
        } else {
            add(product);
        }
    };

    const handleCardClick = () => {
        navigate('/produto', { state: { product } });
    };

    return (
        <div className='product-card' onClick={handleCardClick}>
            <button
                className='favorite-btn'
                aria-label={favorited ? 'Desfavoritar' : 'Favoritar'}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite();
                }}
            >
                <FontAwesomeIcon icon={favorited ? faHeartSolid : faHeartRegular} />
            </button>

            {product.discount && (
                <div className='discount-badge'>
                    {product.discount}% OFF
                </div>
            )}

            <div className='product-card-img'>
                {product.gallery?.map((img, i) => (
                    <img key={i} src={img} alt={`Imagem ${i + 1}`} />
                ))}
            </div>

            <h3 className='product-name'>{t(`names.${product.name}`)}</h3>

            <div className='product-info'>
                <p className='product-price'>{t('R$')} {isPortuguese ? product.price.replace('.', ',') : product.price}</p>
                <button
                    className='add-cart-btn'
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal(product);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <FontAwesomeIcon icon={faCartShopping} />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;