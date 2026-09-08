export type UserRole = 'buyer' | 'agent' | 'admin' | 'super_admin' | string;

export type DashboardPortal = 'buyer' | 'agent' | 'admin';

export const PORTAL_CONFIG: Record<
  DashboardPortal,
  {
    title: string;
    description: string;
    allowedRoles: string[];
    requiredRoleLabel: string;
    route: string;
  }
> = {
  buyer: {
    title: 'Buyer & Renter Portal',
    description: 'Offers, inspection bookings, deposits',
    allowedRoles: ['buyer', 'agent', 'admin', 'super_admin'],
    requiredRoleLabel: 'Registered User',
    route: '/dashboard/buyer',
  },
  agent: {
    title: 'Agent CRM & Performance',
    description: 'Leads pipeline, live chat inbox, listings',
    allowedRoles: ['agent', 'admin', 'super_admin'],
    requiredRoleLabel: 'Licensed Agent',
    route: '/dashboard/agent',
  },
  admin: {
    title: 'System Admin Operations',
    description: 'Metrics, property approvals, users, CSV',
    allowedRoles: ['admin', 'super_admin'],
    requiredRoleLabel: 'System Administrator',
    route: '/dashboard/admin',
  },
};

export const canAccessPortal = (
  userRole: string | undefined | null,
  portal: DashboardPortal
): boolean => {
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  const config = PORTAL_CONFIG[portal];
  if (!config) return false;
  return config.allowedRoles.includes(role);
};

export const getRoleDisplayLabel = (role: string | undefined | null): string => {
  if (!role) return 'Guest';
  switch (role.toLowerCase()) {
    case 'super_admin':
      return 'Super Administrator';
    case 'admin':
      return 'System Admin';
    case 'agent':
      return 'Licensed Agent';
    case 'buyer':
      return 'Buyer / Investor';
    default:
      return role.toUpperCase();
  }
};
