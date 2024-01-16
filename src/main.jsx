import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect } from 'react';
import * as store from './utils/store';
import { initEnv } from './utils/env';
import App from './App';
import { appWindow } from '@tauri-apps/api/window';
import { NextUIProvider } from '@nextui-org/react';
import ReactDOM from 'react-dom/client';
import React from 'react';

import { initStore } from './utils/store';
import { initEnv } from './utils/env';
import App from './App';

if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

document.addEventListener('keydown', async (e) => {
    let allowKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
    if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    if (e.key.startsWith('F') && e.key.length > 1) {
        e.preventDefault();
    }
    if (e.key === 'Escape') {
        await appWindow.close();
    }
});

initStore().then(async () => {
    await initEnv();
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <NextUIProvider>
            <NextThemesProvider attribute='class'>
                <App />
            </NextThemesProvider>
        </NextUIProvider>
    );
});
