import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../../services/product';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import './ProductDetails.css';
import Header from '../../components/Header/Header';
import { formatPrice } from '../../utils/utils';
import ModalMessage from '../../components/ModalMessage/ModalMessage';

const ProductDetails = () => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { t, i18n } = useTranslation();
    const [modal, setModal] = useState({ open: false, title: '', message: '' });
    const navigate = useNavigate();
    const { state } = useLocation();
    const product = state?.product;

    useEffect(() => {
        if (!product) {
            navigate('/');

        }
    }, [product, navigate]);

    useEffect(() => {
        if (product) {
            getProducts({ category: product.category }).then(resp => {
                const others = resp.data.filter(p => p.id !== product.id);
                const shuffled = [...others].sort(() => 0.5 - Math.random()).slice(0, 5);
                setRelatedProducts(shuffled);
            }).catch(() => {
            });
        }
    }, [product]);


    const showModal = (title, message) => {
        setModal({ open: true, title, message });
    };

    const closeModal = () => {
        setModal({ open: false, title: '', message: '' });
    };

    return (

        <div className='product-detail'>
            <Header />
            <div className='product-detail-container'>
                <main className='main-content'>


                    <section className='section section-top'>
                        <div className='image-container'>
                            <img src={product.gallery?.[0]} alt={product.name} />
                        </div>
                        <div className='info-container'>
                            <div className='info-block'>
                                <h1>{t(`names.${product.name}`)}</h1>
                                <p className='price'>{t('R$')} {formatPrice(product.price, i18n.language)}</p>
                                <p><strong>{t('Descrição')}:</strong> {t(`descriptions.${product.description}`)}</p>
                                <div className='tech-info'>
                                    <h3>{t('Ficha Técnica')}</h3>
                                    <p><strong>{t('Categoria')}:</strong> {product.category}</p>
                                    <p><strong>{t('Departamento')}:</strong> {product.department}</p>
                                    <p><strong>{t('Material')}:</strong> {product.material}</p>
                                </div>
                            </div>
                            <div className='button-container'>

                                <div className='quantity-container'>
                                    <h3>{t('Quantidade')}</h3>
                                    <div className='quantity-input'>

                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                    </div>
                                </div>
                                <div className='add-cart-btn-container'>

                                    <button
                                        className='add-cart-btn'
                                        onClick={() => {
                                            addToCart({
                                                productId: product.id,
                                                productProvider: product.provider,
                                                quantity
                                            });
                                            showModal(t('Sucesso'), t('Produto adicionado ao carrinho.'));
                                            setTimeout(() => {
                                                closeModal();
                                                navigate('/');
                                            }, 1500);
                                        }}
                                    >
                                        {t('Adicionar ao Carrinho')}
                                    </button>

                                </div>

                            </div>
                        </div>
                    </section>
                    <section className='section section-bottom'>
                        <h2>{t('Produtos Relacionados')}</h2>
                        <div className='related-products'>
                            {relatedProducts.map(p => (
                                <div key={p.id} className='related-card'>
                                    <img src={p.gallery?.[0]} alt={p.name} />
                                    <p>{t(`names.${p.name}`)}</p>
                                    <span>{t('R$')} {i18n.language === 'pt' ? p.price.toString().replace('.', ',') : p.price}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    {modal.open && (
                        <ModalMessage
                            title={modal.title}
                            message={modal.message}
                            onClose={() => {
                                closeModal();
                            }}
                        />
                    )}
                </main>
            </div>

        </div>
    );
};

export default ProductDetails;
