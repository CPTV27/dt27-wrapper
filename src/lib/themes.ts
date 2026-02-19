export type ThemeId = 'big-muddy' | 'scan2plan' | 'dt27';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  territory: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
  vibe: string;
  persona: string;
}

export const themes: Record<ThemeId, ThemeDefinition> = {
  'big-muddy': {
    id: 'big-muddy',
    name: 'Big Muddy Touring',
    territory: 'Iron & Earth',
    description: 'Music touring fleet, hospitality network, and artist roster.',
    vibe: 'Southern, sharp, cinematic, weathered.',
    persona: 'Delta Dawn',
    colors: {
      background: '#1A1A1A', // Dark
      foreground: '#F5F0E8', // Off-white
      primary: '#D48B2C', // Amber
      secondary: '#2A2A2A', // Darker Gray
      accent: '#B45309', // Deep Amber
      muted: '#737373', // Neutral 500
      border: '#404040', // Neutral 700
    },
    typography: {
      heading: '"Playfair Display", serif',
      body: '"Lora", serif',
      mono: '"JetBrains Mono", monospace',
    },
  },
  'scan2plan': {
    id: 'scan2plan',
    name: 'Scan2Plan',
    territory: 'Professional',
    description: '3D scanning, building documentation, and lead pipeline.',
    vibe: 'Technical, enterprise, precise, clean.',
    persona: 'S2P Operator',
    colors: {
      background: '#FFFFFF', // White
      foreground: '#0F172A', // Slate 900
      primary: '#3B82F6', // Blue 500
      secondary: '#F1F5F9', // Slate 100
      accent: '#2563EB', // Blue 600
      muted: '#64748B', // Slate 500
      border: '#E2E8F0', // Slate 200
    },
    typography: {
      heading: '"Inter", sans-serif',
      body: '"Inter", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
  },
  'dt27': {
    id: 'dt27',
    name: 'DT27 Command',
    territory: 'Iron Clad',
    description: 'Master ledger, financial strategy, and portfolio management.',
    vibe: 'Financial, strategic, authoritative.',
    persona: 'Chief of Staff',
    colors: {
      background: '#1a1a2e', // Navy
      foreground: '#e6e6e6', // Light Gray
      primary: '#16c784', // Money Green
      secondary: '#16213e', // Dark Blue
      accent: '#0f3460', // Deep Blue
      muted: '#6b7280', // Gray 500
      border: '#2e364f', // Blue Gray
    },
    typography: {
      heading: '"JetBrains Mono", monospace',
      body: '"Inter", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
  },
};
