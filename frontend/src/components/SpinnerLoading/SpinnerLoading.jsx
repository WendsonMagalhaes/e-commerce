import React, { useEffect, useState } from 'react';
import './SpinnerLoading.css';

const SpinnerLoading = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev.length === 3) return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='spinner-loading-overlay'>
            <div className='spinner-loading-content'>
                <div className='spinner'></div>
                <p>Carregando Produtos{dots}</p>
            </div>
        </div>
    );
};

export default SpinnerLoading;
