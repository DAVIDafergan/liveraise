export interface Donation {
  id: string;
  fullName: string; // התיקון כאן: fullName במקום firstName ו-lastName
  amount: number;
  dedication?: string; // The message/dedication
  timestamp: number;
}

export interface DonationMethods {
  qrCodeUrl: string;
  qrLabel: string;
  bottomText: string; // Used for bank details or custom text
}

export interface DisplaySettings {
  scale: number; // 1.0 is standard (16px base), 2.0 is double size (32px base)
}

export interface Campaign {
  id: string;
  name: string;
  subTitle: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  donationMethods?: DonationMethods;
  displaySettings?: DisplaySettings;
}

export interface ScreenConfig {
  theme: 'dark' | 'light';
  showConfetti: boolean;
  playAudio: boolean;
}

// Event types for our simulated socket/broadcast channel
export enum EventType {
  NEW_DONATION = 'NEW_DONATION',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  RESET_CAMPAIGN = 'RESET_CAMPAIGN'
}

export interface BroadcastMessage {
  type: EventType;
  payload: any;
}