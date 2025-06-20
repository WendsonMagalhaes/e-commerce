import React, { useEffect, useState } from 'react';
import { getPurchaseHistory } from '../../services/purchase';
import Header from '../../components/Header/Header';
import './PurchaseHistory.css';
import SpinnerLoading from '../../components/SpinnerLoading/SpinnerLoading';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';


export default function PurchaseHistory() {
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState(null);
    const [expandedIds, setExpandedIds] = useState([]);
    const { t, i18n } = useTranslation();
    const isPortuguese = i18n.language === 'pt';
    const isLoggedIn = !!localStorage.getItem('token');


    useEffect(() => {
        if (!isLoggedIn) return;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const { data } = await getPurchaseHistory();
                setPurchaseHistory(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [isLoggedIn]);

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className='history'>
            <Header />
            <div className='history-container'>
                {loading ? (
                    <div className='spinner-loading-overlay' >
                        <SpinnerLoading />
                    </div>
                ) : !isLoggedIn ? (
                    <h2 style={{ marginLeft: '20px', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{t('Para ver seu histórico de compras, é necessário estar logado.')}</h2>
                ) : purchaseHistory.length === 0 ? (
                    <h2 style={{ marginLeft: '20px', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{t('Nenhuma compra feita')}</h2>
                ) : (
                    <div className='history-content'>
                        {purchaseHistory.map(purchase => {
                            const isExpanded = expandedIds.includes(purchase.id);
                            return (
                                <div
                                    key={purchase.id}
                                    className='purchase-card clickable'
                                    onClick={() => toggleExpand(purchase.id)}
                                    aria-expanded={isExpanded}
                                    role='button'
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') toggleExpand(purchase.id);
                                    }}
                                >
                                    <div className='purchase-header'>
                                        <p>
                                            <strong>{t('Compra em')}:</strong> {new Date(purchase.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className='purchase-meta'>
                                            <div className='purchase-total'>
                                                Total: <strong>{t('R$')} {isPortuguese ? Number(purchase.total).toFixed(2).replace('.', ',') : Number(purchase.total).toFixed(2)}</strong>
                                            </div>
                                            <FontAwesomeIcon
                                                icon={isExpanded ? faChevronUp : faChevronDown}
                                                className='arrow-icon'
                                            />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <ul className='purchase-items'>
                                            {purchase.items.map(item => (
                                                <li key={item.product.id} className='purchase-item'>
                                                    <div className='purchase-item-details'>
                                                        <span className='item-name'>{t(`names.${item.product.name}`)}</span>
                                                        <span className='item-details'>
                                                            {item.quantity} x {t('R$')} {isPortuguese ? Number(item.product.price).toFixed(2).replace('.', ',') : Number(item.product.price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <span className='item-subtotal'>
                                                        Subtotal: {t('R$')} {formatPrice((Number(item.product.price) * item.quantity).toFixed(2), i18n.language)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}
