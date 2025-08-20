/**
 * Consistent status color scheme for appointments and other status indicators
 */

export interface StatusColorConfig {
  bg: string;
  border: string;
  text: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const statusColorMap: Record<string, StatusColorConfig> = {
  // Appointment statuses
  'scheduled': {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    variant: 'info'
  },
  'confirmed': {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    variant: 'success'
  },
  'completed': {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    variant: 'success'
  },
  'cancelled': {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    variant: 'danger'
  },
  'no_show': {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    variant: 'danger'
  },
  'pending': {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    variant: 'warning'
  },
  
  // Inventory statuses
  'available': {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    variant: 'success'
  },
  'expiring': {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    variant: 'warning'
  },
  'expired': {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    variant: 'danger'
  },
  'used': {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    variant: 'info'
  }
};

/**
 * Get status color configuration for a given status
 */
export function getStatusColors(status: string): StatusColorConfig {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  return statusColorMap[normalizedStatus] || {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-300',
    variant: 'default'
  };
}

/**
 * Get variant for AdminChip component
 */
export function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  return getStatusColors(status).variant;
}

/**
 * Get inline status classes for direct styling
 */
export function getStatusClasses(status: string): string {
  const colors = getStatusColors(status);
  return `${colors.bg} ${colors.border} ${colors.text}`;
}
