import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

const EDIT_KEY = 'expense-tracker-edit-mode';
const AUTO_MODE_KEY = 'expense-tracker-auto-clear-mode';

export type AutoClearMode = 'off' | '30' | '180' | '365';

const MODE_DAYS: Record<AutoClearMode, number | null> = {
  off: null,
  '30': 30,
  '180': 180,
  '365': 365,
};

interface SettingsContextValue {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  autoClearMode: AutoClearMode;
  setAutoClearMode: (v: AutoClearMode) => void;
  autoClearDays: number | null;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadBool(key: string, def: boolean): boolean {
  const v = localStorage.getItem(key);
  if (v === null) return def;
  return v === 'true';
}

function loadMode(): AutoClearMode {
  const v = localStorage.getItem(AUTO_MODE_KEY);
  if (v === 'off' || v === '30' || v === '180' || v === '365') return v;
  // Migration from old keys
  const oldEnabled = localStorage.getItem('expense-tracker-auto-clear');
  const oldDays = localStorage.getItem('expense-tracker-auto-clear-days');
  if (oldEnabled === 'true') {
    const n = oldDays ? parseInt(oldDays, 10) : 30;
    if (n >= 365) return '365';
    if (n >= 180) return '180';
    return '30';
  }
  return 'off';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditModeState] = useState<boolean>(() => loadBool(EDIT_KEY, false));
  const [autoClearMode, setAutoClearModeState] = useState<AutoClearMode>(() => loadMode());

  useEffect(() => {
    localStorage.setItem(EDIT_KEY, String(editMode));
  }, [editMode]);
  useEffect(() => {
    localStorage.setItem(AUTO_MODE_KEY, autoClearMode);
  }, [autoClearMode]);

  const setEditMode = useCallback((v: boolean) => setEditModeState(v), []);
  const setAutoClearMode = useCallback((v: AutoClearMode) => setAutoClearModeState(v), []);

  return (
    <SettingsContext.Provider
      value={{
        editMode,
        setEditMode,
        autoClearMode,
        setAutoClearMode,
        autoClearDays: MODE_DAYS[autoClearMode],
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
