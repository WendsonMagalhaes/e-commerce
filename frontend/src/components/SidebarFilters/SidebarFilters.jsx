import React, { useState } from 'react';
import { useFilter } from '../../context/FilterContext';
import { useTranslation } from 'react-i18next';
import './SidebarFilters.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const SidebarFilters = ({ isOpen, onClose, allProducts }) => {
    const { filters, updateFilter } = useFilter();
    const { t } = useTranslation();

    const [openSections, setOpenSections] = useState({
        category: false,
        department: false,
        material: false,
        price: false,
        provider: false,
    });

    const toggleSection = (section) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const getGroupedCounts = (key) => {
        const counts = {};
        allProducts.forEach((product) => {
            const value = product[key] || 'unknown';
            counts[value] = (counts[value] || 0) + 1;
        });
        return counts;
    };

    const categories = getGroupedCounts('category');
    const departments = getGroupedCounts('department');
    const materials = getGroupedCounts('material');
    const providers = getGroupedCounts('provider');

    const priceRanges = [
        { label: 'Até R$100', min: 0, max: 100 },
        { label: 'R$101 – R$200', min: 101, max: 200 },
        { label: 'R$201 – R$300', min: 201, max: 300 },
        { label: 'R$301 – R$400', min: 301, max: 400 },
        { label: 'R$401 – R$500', min: 401, max: 500 },
        { label: 'R$501 – R$600', min: 501, max: 600 },
        { label: 'R$601 – R$700', min: 601, max: 700 },
        { label: 'R$701 – R$800', min: 701, max: 800 },
        { label: 'R$801 – R$900', min: 801, max: 900 },
        { label: 'R$901 – R$1000', min: 901, max: 1000 },
        { label: 'Acima de R$1000', min: 1001, max: Infinity },
    ];

    const handleFilterChange = (key, value) => {
        const newValue = filters[key] === value ? '' : value;
        updateFilter(key, newValue);
    };

    const handlePriceRangeChange = (min, max) => {
        const isSelected =
            filters.minPrice === min.toString() && filters.maxPrice === max.toString();

        if (isSelected) {
            updateFilter('minPrice', '');
            updateFilter('maxPrice', '');
        } else {
            updateFilter('minPrice', min.toString());
            updateFilter('maxPrice', max.toString());
        }
    };

    const getPriceRangeCounts = () => {
        return priceRanges.map(range => {
            const count = allProducts.filter(product =>
                product.price >= range.min && product.price <= range.max
            ).length;
            return { ...range, count };
        });
    };

    const renderFilterList = (title, data, key) => {
        const sortedKeys = Object.keys(data).sort((a, b) =>
            t(`${key}.${a}`, { defaultValue: a }).localeCompare(
                t(`${key}.${b}`, { defaultValue: b })
            )
        );

        return (
            <div className='filter-section'>
                <div className='filter-header' onClick={() => toggleSection(key)}>
                    <h4>{t(title)}</h4>
                    <FontAwesomeIcon
                        icon={openSections[key] ? faChevronDown : faChevronRight}
                        className='arrow-icon'
                    />
                </div>
                {openSections[key] && (
                    <ul>
                        {sortedKeys.map((item) => (
                            <li key={item}>
                                <label>
                                    <input
                                        type='checkbox'
                                        value={item}
                                        checked={filters[key]?.includes(item)}
                                        onChange={() => handleFilterChange(key, item)}
                                    />
                                    {` ${t(`${key}.${item}`, { defaultValue: item })} (${data[item]})`}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const renderPriceRanges = (title) => {
        const rangesWithCounts = getPriceRangeCounts();

        return (
            <div className='filter-section'>
                <div className='filter-header' onClick={() => toggleSection('price')}>
                    <h4>{t(title)}</h4>
                    <FontAwesomeIcon
                        icon={openSections.price ? faChevronDown : faChevronRight}
                        className='arrow-icon'
                    />
                </div>
                {openSections.price && (
                    <ul>
                        {rangesWithCounts.map((range, index) => {
                            const checked =
                                filters.minPrice === range.min.toString() &&
                                filters.maxPrice === range.max.toString();

                            return (
                                <li key={index}>
                                    <label>
                                        <input
                                            type='checkbox'
                                            checked={checked}
                                            onChange={() => handlePriceRangeChange(range.min, range.max)}
                                        />
                                        {` ${range.label} (${range.count})`}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className='sidebar-header'>
                <h2>{t('Filtros')}</h2>
                <button className='close-sidebar' onClick={onClose}>×</button>

            </div>
            <aside>
                {renderFilterList('Categoria', categories, 'category')}
                {renderFilterList('Departamento', departments, 'department')}
                {renderFilterList('Material', materials, 'material')}
                {renderPriceRanges('Faixa de Preço')}
                {renderFilterList('Fornecedor', providers, 'provider')}
            </aside>
        </nav>
    );
};

export default SidebarFilters;
