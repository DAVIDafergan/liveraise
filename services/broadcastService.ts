import { BroadcastMessage, EventType } from '../types';

const CHANNEL_NAME = 'liveraise_events';

// Simulating a backend connection using BroadcastChannel
// This allows the Admin Dashboard in one tab to update the Live Screen in another tab immediately.
class BroadcastService {
  private channel: BroadcastChannel;
  private listeners: ((message: BroadcastMessage) => void)[] = [];

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = (event) => {
      this.notifyListeners(event.data);
    };
  }

  public subscribe(callback: (message: BroadcastMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(message: BroadcastMessage) {
    this.listeners.forEach(listener => listener(message));
  }

  public emit(type: EventType, payload: any) {
    const message: BroadcastMessage = { type, payload };
    // Send to other tabs
    this.channel.postMessage(message);
    // Also notify local listeners (in case admin wants to preview in same window)
    this.notifyListeners(message);
  }
}

export const broadcastService = new BroadcastService();