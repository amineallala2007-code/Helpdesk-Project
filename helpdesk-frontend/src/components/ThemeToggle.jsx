import React, { useEffect, useState } from 'react';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeToggle = () => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Activer mode jour' : 'Activer mode nuit'}
            title={isDark ? 'Mode jour' : 'Mode nuit'}
        >
            <span>{isDark ? 'Jour' : 'Nuit'}</span>
            <strong>{isDark ? 'J' : 'N'}</strong>
        </button>
    );
};

export default ThemeToggle;
