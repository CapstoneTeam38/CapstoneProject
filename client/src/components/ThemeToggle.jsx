import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Isolated theme toggle. Currently decorative —
 * the app enforces dark mode via index.html and index.css.
 * Wiring this to a full theme context can be done later.
 */
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
      <span className="font-medium">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;
