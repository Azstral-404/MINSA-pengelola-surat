import { useState, useCallback, useEffect } from 'react';
import { AppData, loadData, saveData, ThemeName, ColorTheme } from '@/lib/store';

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Apply theme + color theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', data.settings.colorTheme || 'default');
    if (data.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.theme, data.settings.colorTheme]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => updater(prev));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    updateData(d => ({ ...d, settings: { ...d.settings, theme } }));
  }, [updateData]);

  const setColorTheme = useCallback((colorTheme: ColorTheme) => {
    updateData(d => ({ ...d, settings: { ...d.settings, colorTheme } }));
  }, [updateData]);

  return { data, updateData, setTheme, setColorTheme };
}
