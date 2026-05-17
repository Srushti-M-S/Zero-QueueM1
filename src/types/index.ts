export type TerminalStatus = 'available' | 'occupied' | 'booked' | 'maintenance';

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  address?: string;
}

export interface Lab {
  id: string;
  institutionId: string;
  name: string;
  location: string;
  capacity: number;
  software: string[];
  operatingHours: string;
  currentOccupancy?: number;
  healthStatus?: 'healthy' | 'warning' | 'critical'; // New
}

export interface Terminal {
  id: string;
  labId: string;
  status: TerminalStatus;
  currentUserId?: string;
  currentUserInitials?: string; // New
  bookingStartTime?: Date; // New
  remainingMinutes?: number; // New for display
  software?: string[];
}

export interface Booking {
  id: string;
  terminalId: string;
  labId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  institutionId?: string;
  role: 'student' | 'staff' | 'admin';
}
