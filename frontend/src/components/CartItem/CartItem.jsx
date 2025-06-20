import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import './CartItem.css'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const CartItem = ({ item, onSelect, onQuantityChange, onRemove, product }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isPortuguese = i18n.language === 'pt';

    const handleCardClick = () => {
        navigate('/produto', { state: { product } });
    };

    return (
        <div className='cart-card' key={item.id}>
            <input
                type='checkbox'
                checked={item.selected}
                onChange={e => onSelect(item.id, e.target.checked)}
            />
            <img
                src={item.product.gallery[0]}
                alt={t(`names.${product.name}`)}
                onClick={handleCardClick}
            />
            <div className='info'>
                <h4 onClick={handleCardClick}>
                    {t(`names.${product.name}`)}
                </h4>
                <span>
                    {t(`descriptions.${product.description}`)}
                </span>

                <div className='info-actions'>
                    <p>{t('R$')} {isPortuguese ? Number(item.product.price).toFixed(2).replace('.', ',') : Number(item.product.price).toFixed(2)}</p>
                    <div className='actions'>

                        <button onClick={() => onQuantityChange(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</button>
                        <a className='remove' onClick={() => onRemove(item.id)}>
                            <FontAwesomeIcon icon={faTrash} className='icon icon-trash' />
                            <FontAwesomeIcon icon={faTimes} className='icon icon-close' />
                        </a>

                    </div>
                </div>
            </div>

        </div >
    );
};

export default CartItem;
