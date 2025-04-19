
// This is a utility to interact with Tauri SQL Plugin
// In a real implementation with proper Tauri setup, this would be connected to the SQLite database

import { Recording } from '@/types/recording';

// Mock database functions for demo purposes
// These would be replaced with actual Tauri SQL plugin calls in a real implementation

export async function saveRecording(recording: Omit<Recording, 'id' | 'createdAt'>): Promise<Recording> {
  // In a real implementation:
  // return await invoke('save_recording', { recording });
  
  // Mock implementation:
  return {
    ...recording,
    id: Math.floor(Math.random() * 1000),
    createdAt: new Date()
  };
}

export async function getRecordings(): Promise<Recording[]> {
  // In a real implementation: 
  // return await invoke('get_recordings');
  
  // Mock implementation:
  return [
    {
      id: 1,
      title: "Voice note 1",
      audioUrl: "",
      duration: 120,
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: 2,
      title: "Meeting notes",
      audioUrl: "",
      duration: 180,
      createdAt: new Date()
    }
  ];
}

export async function deleteRecording(id: number): Promise<boolean> {
  // In a real implementation:
  // return await invoke('delete_recording', { id });
  
  // Mock implementation:
  return true;
}
