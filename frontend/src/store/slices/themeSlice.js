import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
};

// Helper to apply theme class to <html>
const applyThemeClass = (mode) => {
    const html = document.documentElement;
    if (mode === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
};

const initialState = {
    mode: getInitialTheme(), // 'light' or 'dark'
};

// Apply initial theme immediately
applyThemeClass(initialState.mode);

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.mode = action.payload;
            localStorage.setItem('theme', action.payload);
            applyThemeClass(action.payload); // ✅ apply class immediately
        },
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.mode);
            applyThemeClass(state.mode); // ✅ apply class immediately
        },
    },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
