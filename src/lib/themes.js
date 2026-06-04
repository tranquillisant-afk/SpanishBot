// Пять пастельных тем, каждая — пять оттенков одного цвета.
// shade1 — самый светлый (фон), shade5 — самый насыщенный (акцент/текст).

export const THEMES = {
  pink: {
    label: 'Розовая',
    emoji: '🌸',
    shades: ['#fff5f8', '#ffe4ee', '#ffc9dd', '#f7a8c4', '#e57aa3'],
    ink: '#7a2e4d',
  },
  blue: {
    label: 'Голубая',
    emoji: '💧',
    shades: ['#f3f9ff', '#e0f0ff', '#c2e0fb', '#94c8f2', '#5fa6e0'],
    ink: '#244a6b',
  },
  green: {
    label: 'Зелёная',
    emoji: '🌿',
    shades: ['#f4fbf5', '#e1f4e6', '#c3e8cd', '#97d3a9', '#66b87f'],
    ink: '#2c5a3b',
  },
  lavender: {
    label: 'Лавандовая',
    emoji: '🪻',
    shades: ['#f8f5ff', '#ece2ff', '#d8c6fb', '#bba2f0', '#9a7adb'],
    ink: '#4a3877',
  },
  peach: {
    label: 'Персиковая',
    emoji: '🍑',
    shades: ['#fff8f3', '#ffeede', '#ffd9bf', '#ffc09a', '#f59e6f'],
    ink: '#8a4b2c',
  },
}

export const THEME_KEYS = Object.keys(THEMES)

// Применяет тему как CSS-переменные на корневой элемент.
export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.pink
  const root = document.documentElement
  theme.shades.forEach((c, i) => {
    root.style.setProperty(`--c${i + 1}`, c)
  })
  root.style.setProperty('--ink', theme.ink)
  root.style.setProperty('--accent', theme.shades[4])
  root.style.setProperty('--accent-soft', theme.shades[2])
}
