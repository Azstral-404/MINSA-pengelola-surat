import { useState, useCallback, useEffect } from 'react';
import { AppData, loadData, saveData, ThemeName } from '@/lib/store';

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', data.settings.theme);
  }, [data.settings.theme]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    updateData(d => ({ ...d, settings: { ...d.settings, theme } }));
  }, [updateData]);

  return { data, updateData, setTheme };
}
