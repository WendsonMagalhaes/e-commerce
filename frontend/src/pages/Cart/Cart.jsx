import React, { useEffect, useState } from 'react';
import { getProductUnifiedById } from '../../services/product';
import { finalizePurchase } from '../../services/purchase'
import {
    getCartItems,
    updateCartItemQty,
    selectCartItem,
    removeCartItem,
} from '../../services/cart'
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faClose } from '@fortawesome/free-solid-svg-icons';
import './Cart.css';
import CartItem from '../../components/CartItem/CartItem';
import SpinnerLoading from '../../components/SpinnerLoading/SpinnerLoading';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatPriceValue } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import ModalMessage from '../../components/ModalMessage/ModalMessage';


export default function Cart() {
    const token = localStorage.getItem('token');
    const {
        items: localItems,
        updateQuantity,
        selectItem,
        removeFromCart,
        clearCart
    } = useCart();

    const [remoteCart, setRemoteCart] = useState({ items: [], total: 0 });
    const [anonCart, setAnonCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const { t, i18n } = useTranslation();
    const [modal, setModal] = useState({ open: false, title: '', message: '', type: '' });
    const cart = token ? remoteCart : anonCart;
    const isPortuguese = i18n.language === 'pt';
    const navigate = useNavigate();


    const loadRemoteCart = async () => {
        setLoading(true);
        try {
            const { data } = await getCartItems();
            setRemoteCart(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadRemoteCart();
        } else {
            const loadAnonCart = async () => {
                setLoading(true);
                try {
                    const detailed = await Promise.all(
                        localItems.map(async ({ productId, productProvider, quantity, selected }) => {
                            const res = await getProductUnifiedById(productProvider, productId);
                            const product = res.data;
                            const subtotal = Number(product.price) * quantity;
                            return {
                                id: productId,
                                product,
                                quantity,
                                selected: selected ?? true,
                                subtotal
                            };
                        })
                    );
                    const total = detailed.reduce((sum, it) => sum + it.subtotal, 0);
                    setAnonCart({ items: detailed, total });
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            };

            loadAnonCart();
        }
    }, [token, localItems]);


    useEffect(() => {
        if (token && localItems.length > 0) clearCart();
    }, [token, localItems, clearCart]);


    const handleQuantityChange = async (itemId, newQty) => {
        if (newQty < 1) return;
        if (token) {
            await updateCartItemQty(itemId, newQty);
            loadRemoteCart();
        } else {
            updateQuantity(itemId, newQty);
        }
    };

    const handleSelect = async (itemId, selected) => {
        if (token) {
            await selectCartItem(itemId, selected);
            loadRemoteCart();
        } else {
            selectItem(itemId, selected);
        }
    };

    const handleRemove = async (itemId) => {
        if (token) {
            await removeCartItem(itemId);
            loadRemoteCart();
        } else {
            removeFromCart(itemId);
        }
    };

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        cart.items.forEach(item => handleSelect(item.id, checked));
    };

    const handleFinalizePurchase = async () => {
        if (!token) {
            navigate('/login', {
                state: { message: t('Você precisa estar logado para finalizar a compra.') }
            });
            return;
        }

        const selectedItems = cart.items
            .filter(item => item.selected)
            .map(item => ({
                productId: item.id,
                productProvider: item.product.provider,
                quantity: item.quantity
            }));

        if (selectedItems.length === 0) {
            showModal(t('Atenção'), t('Selecione pelo menos um item para finalizar a compra.'), 'warning');
            return;
        }

        const total = selectedItems.reduce((sum, item) => {
            const product = cart.items.find(p => p.id === item.productId)?.product;
            return sum + (product?.price || 0) * item.quantity;
        }, 0);

        try {
            setLoading(true);
            await finalizePurchase({ items: selectedItems, total });
            showModal(t('Sucesso'), t('Compra finalizada com sucesso!'), 'sucess');
            setTimeout(() => {
                closeModal();
                loadRemoteCart();
                navigate('/sales');
            }, 1500);

        } catch (error) {
            console.error('Erro na finalização:', error);
            showModal(t('Erro'), t('Erro ao finalizar compra: ') + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };
    const showModal = (title, message, type) => {
        setModal({ open: true, title, message, type });
    };


    const closeModal = () => {
        setModal({ open: false, title: '', message: '' });
    };



    return (
        <div className='cart'>
            <Header />

            {loading ? (

                <div className='spinner-loading-overlay'>
                    <SpinnerLoading />
                </div>) : cart.items.length === 0 ? (
                    <h2 style={{ marginLeft: '20px', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{t('Você ainda não adicionou nenhum produto ao carrinho.')}</h2>
                ) : (
                <div className='cart-container'>

                    <div className='cart-content'>


                        <div className='cart-container-items'>

                            <div className='cart-toolbar'>
                                <div className='cart-toolbar-select'>
                                    <input
                                        type='checkbox'
                                        checked={selectAll}
                                        onChange={e => handleSelectAll(e.target.checked)}
                                    />
                                    <span>{t('Selecionar Todos')}</span>
                                </div>
                                <div className='cart-toolbar-info'>

                                    <span className='item-count'>{cart.items.length} {t('produtos')}</span>
                                </div>
                            </div>

                            <div className='cart-cards'>
                                {cart.items.map(item => (
                                    <CartItem
                                        id={item.id}
                                        product={item.product}
                                        key={item.id}
                                        item={item}
                                        onSelect={handleSelect}
                                        onQuantityChange={handleQuantityChange}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </div>

                        </div>

                        <div className='cart-summary'>
                            <div className='cart-summary-title'>
                                <h2>{t('Resumo da Compra')}</h2>

                            </div>
                            <div className='cart-summary-container'>
                                <ul className='summary-items'>
                                    {cart.items
                                        .filter(item => item.selected)
                                        .map(item => (
                                            <li key={item.id} className='summary-item'>
                                                <div className='summary-item-info'>
                                                    <span className='item-name'> {t(`names.${item.product.name}`)}</span>
                                                    <div className='item-info-price'>
                                                        <span className='item-price'>{item.quantity} x {t('R$')} {isPortuguese ? Number(item.product.price).toFixed(2).replace('.', ',') : Number(item.product.price).toFixed(2)}
                                                        </span>
                                                        <span className='item-price'>{t('R$')}
                                                            {formatPrice((Number(item.product.price) * item.quantity).toFixed(2), i18n.language)}</span>
                                                    </div></div>
                                                <button
                                                    className='remove-button'
                                                    onClick={() => handleSelect(item.id, false)}
                                                    title='Remover item'
                                                >
                                                    <FontAwesomeIcon icon={faClose} />
                                                </button>
                                            </li>
                                        ))}
                                </ul>

                                <div className='summary-details'>
                                    <p>{t('Total de Itens:')} <strong>{cart.items.filter(i => i.selected).reduce((sum, i) => sum + i.quantity, 0)}</strong></p>
                                    <p >{t('Valor Total:')} <strong>{t('R$')} {
                                        formatPriceValue(
                                            cart.items.filter(i => i.selected)
                                                .reduce((sum, i) => sum + i.quantity * Number(i.product.price), 0),
                                            i18n.language
                                        )
                                    }</strong></p>
                                </div>
                                <div className='finalize-button'>
                                    <button onClick={handleFinalizePurchase} disabled={loading}>
                                        {loading ? t('Finalizando...') : t('Finalizar Compra')}
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            )

            }
            {modal.open && (
                <ModalMessage
                    title={modal.title}
                    message={modal.message}
                    type={modal.type}
                    onClose={() => {
                        closeModal();
                    }}
                />
            )}

        </div >

    );
} 