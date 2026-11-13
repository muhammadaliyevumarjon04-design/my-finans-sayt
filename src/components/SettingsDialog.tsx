import { useState } from 'react';
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import { useCategories, type CategoryKind } from '@/context/CategoriesContext';
import { useSettings, type AutoClearMode } from '@/context/SettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Switch } from '@/components/ui/switch';

interface SettingsDialogProps {
  onClose: () => void;
}

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const { t } = useLanguage();
  const { expenseCategories, incomeCategories, addCategory, removeCategory, renameCategory } = useCategories();
  const { editMode, setEditMode, autoClearMode, setAutoClearMode } = useSettings();

  const inputClass =
    'w-full bg-secondary border border-border px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border p-8 w-full max-w-md space-y-5 max-h-[90vh] my-auto flex flex-col overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-card-foreground">
            {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
            aria-label={t('cancel')}
          >
            <X size={16} />
          </button>
        </div>

        <CategorySection
          kind="expense"
          title={t('expenseCategories')}
          items={expenseCategories}
          add={(n) => addCategory('expense', n)}
          remove={(n) => removeCategory('expense', n)}
          rename={(o, n) => renameCategory('expense', o, n)}
          inputClass={inputClass}
          accent="primary"
        />

        <CategorySection
          kind="income"
          title={t('incomeCategories')}
          items={incomeCategories}
          add={(n) => addCategory('income', n)}
          remove={(n) => removeCategory('income', n)}
          rename={(o, n) => renameCategory('income', o, n)}
          inputClass={inputClass}
          accent="lime"
        />

        <div className="space-y-4 border-t border-border pt-4">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
            {t('journalSettings')}
          </label>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm text-card-foreground font-bold">{t('editJournal')}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t('editJournalHint')}</div>
            </div>
            <Switch checked={editMode} onCheckedChange={setEditMode} />
          </div>

          <div>
            <div className="text-sm text-card-foreground font-bold mb-1">{t('autoClear')}</div>
            <div className="text-[10px] text-muted-foreground mb-3">{t('autoClearHint')}</div>
            <div className="grid grid-cols-2 gap-2">
              {(['off', '30', '180', '365'] as AutoClearMode[]).map((mode) => {
                const active = autoClearMode === mode;
                const labelKey =
                  mode === 'off'
                    ? 'autoClearOff'
                    : mode === '30'
                    ? 'autoClear30'
                    : mode === '180'
                    ? 'autoClear180'
                    : 'autoClear365';
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAutoClearMode(mode)}
                    className={
                      'px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ' +
                      (active
                        ? 'bg-primary/15 border-primary/50 text-primary'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:text-card-foreground hover:bg-secondary')
                    }
                  >
                    {t(labelKey as never)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 border border-border text-sm font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

interface CategorySectionProps {
  kind: CategoryKind;
  title: string;
  items: string[];
  add: (name: string) => void;
  remove: (name: string) => void;
  rename: (oldName: string, newName: string) => void;
  inputClass: string;
  accent: 'primary' | 'lime';
}

function CategorySection({ title, items, add, remove, rename, inputClass, accent, kind }: CategorySectionProps) {
  const { t } = useLanguage();
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    add(newName);
    setNewName('');
  };

  const startEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };

  const saveEdit = () => {
    if (editingName && editValue.trim()) rename(editingName, editValue);
    setEditingName(null);
    setEditValue('');
  };

  const btnAccent =
    accent === 'lime'
      ? 'bg-lime/10 border-lime/40 text-lime hover:bg-lime/20'
      : 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20';
  const editAccent = accent === 'lime' ? 'hover:text-lime' : 'hover:text-primary';
  const checkAccent = accent === 'lime' ? 'text-lime' : 'text-primary';
  const focusBorder = accent === 'lime' ? 'focus:border-lime' : 'focus:border-primary';

  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
        {title}
      </label>

      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('newCategory')}
          className={inputClass}
        />
        <button
          type="submit"
          className={`px-3 border transition-colors flex items-center justify-center ${btnAccent}`}
          aria-label={t('add')}
        >
          <Plus size={16} />
        </button>
      </form>

      <ul className="space-y-1.5 overflow-auto max-h-[30vh] pr-1">
        {items.map((c) => (
          <li
            key={`${kind}-${c}`}
            className="flex items-center gap-2 bg-secondary/50 border border-border px-3 py-2"
          >
            {editingName === c ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditingName(null);
                  }}
                  className={`flex-1 bg-background border border-border px-2 py-1 text-sm text-card-foreground focus:outline-none ${focusBorder}`}
                />
                <button
                  onClick={saveEdit}
                  className={`${checkAccent} hover:opacity-80`}
                  aria-label={t('save')}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingName(null)}
                  className="text-muted-foreground hover:text-card-foreground"
                  aria-label={t('cancel')}
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-card-foreground">{c}</span>
                <button
                  onClick={() => startEdit(c)}
                  className={`text-muted-foreground ${editAccent}`}
                  aria-label={t('edit')}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(c)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t('delete')}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-muted-foreground text-center py-4">
            {t('noCategories')}
          </li>
        )}
      </ul>
    </div>
  );
}
