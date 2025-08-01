// Firebase data models for the salon booking app

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  salonId: string;
  availability: Record<string, ProviderAvailabilityDay>;
  services: ProviderService[];
  order?: number;
  isTeamMember: boolean;
  teamMemberId?: string;
  receiveNotifications: boolean;
  userId?: string;
  bookingUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProviderAvailabilityDay {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  defaultDuration?: number;
  requiresConsultation?: boolean;
  salonId: string;
  order?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProviderService {
  serviceId: string;
  duration: number;
  isSpecialty: boolean;
  requiresConsultation: boolean;
}

export interface BookingRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  stylistPreference: string;
  dateTimePreference: string;
  notes?: string;
  waitlistOptIn: boolean;
  status: 'pending' | 'contacted' | 'booked' | 'not-booked' | 'provider-requested';
  salonId: string;
  submittedByProvider?: boolean;
  providerId?: string;
  providerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  bookingUrl: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  businessType?: string;
  settings: SalonSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalonSettings {
  notifications: NotificationSettings;
  businessHours: BusinessHours;
  booking: BookingSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  bookingConfirmation: boolean;
  bookingReminders: boolean;
  smsRecipients?: SmsRecipient[];
  emailRecipients?: EmailRecipient[];
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface BookingSettings {
  requireConsultation: boolean;
  allowWaitlist: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'admin' | 'front_desk' | 'service_provider' | 'member';
  status: 'active' | 'pending' | 'invited';
  invitedAt: Date;
  joinedAt?: Date;
  salonId: string;
  userId: string;
  permissions?: TeamMemberPermissions;
}

export interface TeamMemberPermissions {
  // Dashboard Access
  canViewRequests: boolean;
  canManageRequests: boolean;
  canViewClients: boolean;
  canManageClients: boolean;
  canViewLoyalty: boolean;
  canManageLoyalty: boolean;
  
  // Settings Access
  canViewSettings: boolean;
  canManageServices: boolean;
  canManageProviders: boolean;
  canManageNotifications: boolean;
  canManageTeam: boolean;
  canManageSalon: boolean;
  
  // Admin Access
  canViewAnalytics: boolean;
  canManageBilling: boolean;
  canAccessAdmin: boolean;
  
  // Provider-specific permissions
  canManageOwnSchedule: boolean;
  canViewOwnBookings: boolean;
  canManageOwnServices: boolean;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: TeamMemberPermissions;
  color: string;
}

export interface Invitation {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  permissions?: TeamMemberPermissions;
  salonId: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedAt: Date;
  expiresAt: Date;
  invitedBy: string;
}

export interface SmsRecipient {
  phone: string;
  enabled: boolean;
}

export interface EmailRecipient {
  email: string;
  enabled: boolean;
}

// Loyalty Program Interfaces
export interface LoyaltyProgram {
  id: string;
  salonId: string;
  name: string;
  description: string;
  visitsRequired: number;
  rewardType: 'percentage' | 'fixed' | 'service';
  rewardValue: string; // "20" for 20% off, "$10" for $10 off, "Free Haircut" for service
  expirationDays?: number; // Optional expiration
  welcomeMessage?: string;
  rewardMessage?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CustomerPass {
  id: string;
  passId: string; // Unique identifier for QR codes
  salonId: string;
  loyaltyProgramId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  currentVisits: number;
  totalVisits: number;
  isRedeemed: boolean;
  redeemedAt?: Date | string;
  expiresAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VisitRecord {
  id: string;
  customerPassId: string;
  salonId: string;
  loyaltyProgramId: string;
  customerName: string;
  recordedBy: string; // Staff member who recorded the visit
  recordedAt: Date | string;
  method: 'qr_scan' | 'manual_entry';
  notes?: string;
}

// Extended Client interface with loyalty data
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  salonId: string;
  loyalty?: {
    passId: string;
    currentVisits: number;
    totalVisits: number;
    rewardsEarned: number;
    loyaltyProgramId: string;
    passAddedAt: Date | string;
    lastVisitAt?: Date | string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Shift Change Request Interfaces
export interface ShiftChangeRequest {
  id: string;
  providerId: string;
  providerName: string;
  salonId: string;
  currentShift: {
    date: string;
    startTime: string;
    endTime: string;
  };
  requestedShift: {
    date: string;
    startTime: string;
    endTime: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
} 