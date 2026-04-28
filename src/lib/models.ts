export type ToolStatus = 'active' | 'inactive' | 'experimental';

export interface Tool {
  id: string;
  title: string;
  description: string;
  href?: string;
  status: ToolStatus;
  category?: string;
  
  // UI Display Props (Optional overrides)
  label?: string; // e.g., "Próximamente", "Beta", "Nuevo"
  isExternal?: boolean;
  featured?: boolean;
}
