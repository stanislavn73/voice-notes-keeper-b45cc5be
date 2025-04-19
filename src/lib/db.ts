
import { Recording } from '@/types/recording';

export async function saveRecording(recording: Omit<Recording, 'id' | 'createdAt'>): Promise<Recording> {
  return {
    ...recording,
    id: Math.floor(Math.random() * 1000),
    createdAt: new Date()
  };
}

export async function getRecordings(): Promise<Recording[]> {
  return [
    {
      id: 1,
      title: "Voice note 1",
      description: "First voice note",
      audioUrl: "",
      duration: 120,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 2,
      title: "Meeting notes",
      description: "Team sync meeting",
      audioUrl: "",
      duration: 180,
      createdAt: new Date()
    }
  ];
}

export async function deleteRecording(id: number): Promise<boolean> {
  return true;
}
