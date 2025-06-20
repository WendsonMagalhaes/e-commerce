import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/product';
import { getFavorites } from '../../services/favorite';
import ProductCard from '../../components/ProductCard/ProductCard';
import Header from '../../components/Header/Header';
import SidebarFilters from '../../components/SidebarFilters/SidebarFilters';
import { useFilter } from '../../context/FilterContext';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import SpinnerLoading from '../../components/SpinnerLoading/SpinnerLoading'; // ajuste o caminho
import ModalMessage from '../../components/ModalMessage/ModalMessage';


import './Home.css';

const Home = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { filters, nameFilter } = useFilter();
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const [modalProduct, setModalProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [modal, setModal] = useState({ open: false, title: '', message: '', type: '' });

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const openModalProduct = (product) => {
        setModalProduct(product);
        setQuantity(1);
    };

    const closeModalProduct = () => {
        setModalProduct(null);
    };

    const showModal = (title, message, type) => {
        setModal({ open: true, title, message, type });
    };


    const closeModal = () => {
        setModal({ open: false, title: '', message: '' });
    };

    const handleAdd = () => {
        if (!modalProduct) return;
        addToCart({
            productId: modalProduct.id,
            productProvider: modalProduct.provider,
            quantity,
        });

        showModal(t('Sucesso'), t('Produto adicioando ao carrinho'), 'sucess');
        setTimeout(() => {
            closeModal();
            closeModalProduct();

        }, 1000);
    };
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const query = {};
                ['category', 'department', 'material', 'provider', 'name'].forEach((key) => {
                    if (filters[key]) query[key] = filters[key];
                });

                if (filters.minPrice) query.minPrice = filters.minPrice;
                if (filters.maxPrice && filters.maxPrice !== 'Infinity') {
                    query.maxPrice = filters.maxPrice;
                }

                const token = localStorage.getItem('token');
                const productsRes = await getProducts(query);

                let favoritesRes = { data: [] };
                if (token) {
                    favoritesRes = await getFavorites(token);
                }

                const favIds = favoritesRes.data.map(fav => fav.productId);

                const productsWithFav = productsRes.data.map(product => ({
                    ...product,
                    isFavorited: favIds.includes(product.id)
                }));

                setAllProducts(productsWithFav);
            } catch (error) {
                console.error('Erro ao buscar produtos ou favoritos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [
        filters
    ]);


    const filterName = (nameFilter || '').toLowerCase();

    const filteredProducts = allProducts.filter(product => {
        const translatedName = t(`names.${product.name}`, { defaultValue: product.name }).toLowerCase();
        return translatedName.includes(filterName);
    });


    return (
        <div className='home'>
            <Header onMenuClick={toggleSidebar} />
            <div className='home-container'>

                <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <SidebarFilters isOpen={isSidebarOpen} onClose={closeSidebar} allProducts={allProducts} />
                </aside>
                {isSidebarOpen && <div className='sidebar-overlay' onClick={closeSidebar}></div>}


                <main className='main-content'>

                    <h2>{t('Lista de Produtos')}</h2>
                    {loading ? (

                        <div className='spinner-loading-overlay'>
                            <SpinnerLoading />
                        </div>) : filteredProducts.length === 0 ? (
                            <p>{t('Nenhum produto encontrado')}</p>
                        ) : (
                        <div className='product-grid'>
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={`${product.provider}-${product.id}`}
                                    product={product}
                                    onOpenModal={openModalProduct}
                                />
                            ))}
                        </div>
                    )}
                </main>

            </div>
            {
                modalProduct && (
                    <div className='modal-overlay' onClick={closeModalProduct}>
                        <div className='product-modal' onClick={(e) => e.stopPropagation()}>
                            <button className='close-modal' onClick={closeModalProduct}>×</button>
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
                    </div>
                )
            }
        </div >
    );
};

export default Home;
