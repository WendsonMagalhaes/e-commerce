import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isLightTheme, setIsLightTheme] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') setIsLightTheme(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isLightTheme;
        setIsLightTheme(newTheme);
        localStorage.setItem('theme', newTheme ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ isLightTheme, toggleTheme }}>
            <div className={isLightTheme ? 'light' : ''}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
