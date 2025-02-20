import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate' | 
  'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden' | 
  'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe' | 'black' | 
  'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business' | 'acid' | 'lemonade' | 
  'night' | 'coffee' | 'winter';

interface ThemeState {
  current: Theme;
}

// Get initial theme from localStorage if available
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  }
  return 'light';
};

const initialState: ThemeState = {
  current: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.current = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer; 