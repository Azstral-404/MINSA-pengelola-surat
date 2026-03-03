import { useState, useCallback, useEffect } from 'react';
import { AppData, loadData, saveData, ThemeName } from '@/lib/store';

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Apply theme as class on html
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.theme]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => updater(prev));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    updateData(d => ({ ...d, settings: { ...d.settings, theme } }));
  }, [updateData]);

  return { data, updateData, setTheme };
}
