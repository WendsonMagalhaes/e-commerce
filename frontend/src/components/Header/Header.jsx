import React, { useState, useEffect } from 'react';
import './Header.css';
import { useFilter } from '../../context/FilterContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


import {
    faHeart,
    faShoppingCart,
    faUser,
    faHistory,
    faSun,
    faMoon,
    faSearch,
    faFilter
} from '@fortawesome/free-solid-svg-icons';

import { getProducts } from '../../services/product';

const Header = ({ onMenuClick }) => {
    const [allCategories, setAllCategories] = useState([]);
    const { filters, nameFilter, updateFilter } = useFilter();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { isLightTheme, toggleTheme } = useTheme(); const navigate = useNavigate();
    const [searchText, setSearchText] = useState(nameFilter || '');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [userName, setUserName] = useState('');



    const routeTitles = {
        '/': 'Home',
        '/about': t('Sobre'),
        '/contact': t('Contato'),
        '/produto': t('Detalhes do Produto'),
        '/cart': t('Meu Carrinho'),
        '/favorite': t('Meus Favoritos'),
        '/sales': t('Histórico de Compras')


    };
    const title = routeTitles[location.pathname] || 'Página';

    useEffect(() => {
        getProducts({ name: '' })
            .then(res => {
                const uniqueCategories = Array.from(
                    new Set(res.data.map(product => product.category).filter(Boolean))
                );
                setAllCategories(uniqueCategories);
            })
            .catch(err => console.error('Erro ao buscar categorias:', err));
    }, []);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserName(decoded.name || decoded.name || 'Usuário');
            } catch (e) {
                setUserName('Usuário');
            }
        }
    }, []);

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        i18n.changeLanguage(selectedLanguage);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFilter(name, value);
        if (name === 'name') setSearchText(value);
    };



    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilter('name', searchText);
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        setIsLoggedIn(false);
        setShowAccountMenu(false);
        navigate('/');
    };


    const sortedCategoryKeys = allCategories
        .filter(key => key !== 'All')
        .sort((a, b) =>
            t(`category.${a}`, { defaultValue: a }).localeCompare(
                t(`category.${b}`, { defaultValue: b })
            )
        );

    return (
        <div>
            <header className='header'>
                <div className='header-row'>
                    <div className='header-left'>
                        {location.pathname === '/' && (
                            <button className='menu-toggle-button' onClick={onMenuClick}>
                                <FontAwesomeIcon icon={faFilter} />
                            </button>
                        )}

                        <h2 className='site-title'>E-commerce</h2>
                    </div>

                    <div className='header-right'>
                        <select
                            name='language'
                            defaultValue={i18n.language}
                            aria-label='Idioma'
                            onChange={handleLanguageChange}
                        >
                            <option value='pt'>Português</option>
                            <option value='en'>English</option>
                        </select>
                        <div className='toggle-switch' onClick={toggleTheme}>
                            <div className={`switch ${isLightTheme ? 'light' : 'dark'}`}>
                                {isLightTheme ? <FontAwesomeIcon icon={faMoon} className='icon' /> : <FontAwesomeIcon icon={faSun} className='icon' />}
                            </div>
                        </div>

                    </div>
                </div>
                <div className='header-row search-row' >
                    <div className='search-group'>
                        <input
                            type='text'
                            name='name'
                            placeholder={t('Buscar produto...')}
                            value={nameFilter || ''}
                            onChange={handleChange}
                        />

                        <div className='icon-search-group' onClick={handleSearchSubmit}>
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                        <select
                            name='category'
                            value={filters.category || ''}
                            onChange={handleChange}
                        >
                            <option value=''>{t('category.All')}</option>
                            {sortedCategoryKeys.map((key) => (
                                <option key={key} value={key}>
                                    {t(`category.${key}`, { defaultValue: key })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='icons-group'>


                        <button
                            className="icon-button"
                            title="Histórico"
                            onClick={() => { navigate('/sales'); }}
                        >
                            <FontAwesomeIcon icon={faHistory} title='Histórico' />
                        </button>
                        <button
                            className="icon-button"
                            title="Favoritos"
                            onClick={() => { navigate('/favorite'); }}
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <button
                            className="icon-button"
                            title="Carrinho"
                            onClick={() => { navigate('/cart'); }}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                        </button>

                        <div className='account-menu-container'>
                            <button className='icon-button' onClick={() => setShowAccountMenu(!showAccountMenu)}>
                                <FontAwesomeIcon icon={faUser} title='Conta' />
                            </button>

                            {showAccountMenu && (
                                <div className='account-menu'>
                                    {isLoggedIn ? (
                                        <div className='menu-options'>
                                            <span className='welcome-text'>{t('Bem-vindo')}, {userName}</span>
                                            <button className='menu-btn' onClick={handleLogout}>{t('Sair')}</button>
                                        </div>
                                    ) : (
                                        <div className='menu-options'>
                                            <button
                                                className='menu-btn'
                                                onClick={() => {
                                                    setShowAccountMenu(false);
                                                    navigate('/login');
                                                }}
                                            >
                                                Login
                                            </button>
                                            <button
                                                className='menu-btn'
                                                onClick={() => {
                                                    setShowAccountMenu(false);
                                                    navigate('/register');
                                                }}
                                            >
                                                {t('Registrar')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                <div className='header-row menu-row'>
                    <div className='header-title'>
                        <h1>{title}</h1>
                    </div>

                    <nav className='main-menu'>
                        <a href='/'>Home</a>
                        <a href='/about'>{t('About')}</a>
                        <a href='/contact'>{t('Contact')}</a>
                    </nav>
                </div>

            </header>
        </div>
    );
};

export default Header;
