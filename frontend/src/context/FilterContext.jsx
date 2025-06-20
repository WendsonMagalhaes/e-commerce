import React, { createContext, useContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [nameFilter, setNameFilter] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        department: [],
        material: [],
        provider: [],
        minPrice: '',
        maxPrice: '',
    });

    const updateFilter = (key, value) => {
        if (key === 'name') {
            setNameFilter(value);
        } else if (['department', 'material', 'provider'].includes(key)) {
            setFilters((prev) => {
                const currentValues = prev[key];
                if (currentValues.includes(value)) {
                    return { ...prev, [key]: currentValues.filter(v => v !== value) };
                } else {
                    return { ...prev, [key]: [...currentValues, value] };
                }
            });
        } else {
            setFilters((prev) => ({
                ...prev,
                [key]: value
            }));
        }
    };

    const resetFilters = () => {
        setNameFilter('');
        setFilters({
            category: '',
            department: [],
            material: [],
            provider: [],
            minPrice: '',
            maxPrice: '',
        });
    };

    return (
        <FilterContext.Provider value={{ filters, nameFilter, updateFilter, resetFilters }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => useContext(FilterContext);
