export type NavigationTab =
  | 'command-center'
  | 'dashboard'
  | 'events'
  | 'staff'
  | 'inventory'
  | 'vendors'
  | 'budget'
  | 'reports'
  | 'settings';

export type UserRole =
  | 'Superadmin'
  | 'Admin'
  | 'Event Producer'
  | 'Operations Manager'
  | 'Logistics Coordinator'
  | 'Finance Specialist';

export const PERMISSION_KEYS = [
  'viewEvents',
  'editEvents',
  'viewFinancials',
  'approveBudget',
  'manageUsers',
  'manageRoles',
  'resolveConflicts',
  'manageInventory',
  'manageVendors',
] as const;

export type PermissionKey = typeof PERMISSION_KEYS[number];

export interface UserPermissions {
  viewEvents: boolean;
  editEvents: boolean;
  viewFinancials: boolean;
  approveBudget: boolean;
  manageUsers: boolean;
  manageRoles: boolean;
  resolveConflicts: boolean;
  manageInventory: boolean;
  manageVendors: boolean;
}

export interface RoleDoc {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: UserPermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  roleId?: string;
  department: string;
  status: 'Active' | 'On Shift' | 'Away' | 'Inactive';
  mustChangePassword?: boolean;
  permissions: UserPermissions;
}

export interface Alert {
  id: string;
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  category: 'financial' | 'logistics' | 'staffing' | 'vendor';
  description: string;
  timestamp: string;
  eventName?: string;
  snoozed?: boolean;
  acknowledged?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface EventTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
}

export interface EventFile {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'CAD' | 'Doc' | 'Image';
  uploadDate: string;
  url?: string;
}

export interface EventTeamMember {
  name: string;
  avatar: string;
  role: string;
}

export interface EventItem {
  id: string;
  name: string;
  code: string;
  client: string;
  type: 'Gala' | 'Conference' | 'Exhibition' | 'Concert' | 'Product Launch';
  status: 'Planning' | 'In Progress' | 'Finalizing' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  budgetAllocated: number;
  budgetSpent: number;
  completionPercent: number;
  team: EventTeamMember[];
  milestones: Milestone[];
  tasks: EventTask[];
  files: EventFile[];
}

export interface ShiftItem {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar: string;
  role: string;
  department: 'A/V Tech' | 'Stage Hands' | 'Hospitality' | 'Logistics' | 'Security';
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  eventId: string;
  eventName: string;
  status: 'Confirmed' | 'Pending' | 'Conflict';
  conflictNote?: string;
}

export interface AssetHistory {
  date: string;
  action: string;
  user: string;
}

export interface AssetItem {
  id: string;
  name: string;
  category: 'A/V Equipment' | 'Lighting' | 'Staging' | 'Furniture' | 'Catering Hardware';
  code: string;
  status: 'In Use' | 'Available' | 'Maintenance' | 'Checked Out';
  location: string;
  value: number;
  currentAssignee?: string;
  qrCode: string;
  maintenanceDate: string;
  imageUrl?: string;
  history: AssetHistory[];
}

export interface PendingQuote {
  id: string;
  title: string;
  amount: number;
  eventName: string;
  status: 'Pending Review' | 'Approved' | 'Declined';
}

export interface VendorItem {
  id: string;
  name: string;
  category: 'A/V Production' | 'Catering & Hospitality' | 'Staging & Trussing' | 'Security & Staffing' | 'Decor & Lighting';
  rating: number;
  status: 'Preferred' | 'Active' | 'Under Review';
  contactPerson: string;
  email: string;
  phone: string;
  activeContracts: number;
  qualityScore: number;
  onTimeRate: number;
  costVariance: number;
  pendingQuotes: PendingQuote[];
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  eventName: string;
  estimatedAmount: number;
  actualAmount: number;
  status: 'Approved' | 'Pending' | 'Invoiced' | 'Paid';
  invoiceNumber?: string;
  zatcaStatus?: 'Compliant' | 'Pending QR' | 'N/A';
}

export interface ActivityLog {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timeAgo: string;
  category: 'event' | 'budget' | 'asset' | 'staff' | 'alert';
}
