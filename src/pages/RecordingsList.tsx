
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Recording } from '@/types/recording';
import { getRecordings, deleteRecording as deleteRecordingFromDb } from '@/lib/db';

const RecordingsList = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const data = await getRecordings();
      setRecordings(data);
    } catch (error) {
      console.error('Failed to load recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-normal text-red-500">VoiceShare</h1>
        <div className="w-10 h-10 rounded-full bg-green-500" />
      </header>

      <div className="flex justify-between mb-8">
        <h2 className="text-2xl font-bold">My recordings</h2>
        <Button 
          onClick={() => navigate('/record')}
          className="bg-red-500 hover:bg-red-600"
        >
          + New
        </Button>
      </div>

      <div className="space-y-4">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{recording.title}</h3>
              <p className="text-gray-500">{recording.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span>{formatTime(recording.duration)}</span>
              <button className="text-red-500 hover:text-red-600">Copy URL</button>
              <button className="text-red-500 hover:text-red-600">Edit</button>
              <button 
                className="text-red-500 hover:text-red-600"
                onClick={() => deleteRecordingFromDb(recording.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingsList;
