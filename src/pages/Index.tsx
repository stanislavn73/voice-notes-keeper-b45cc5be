
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import { StopCircle, RefreshCcw } from "lucide-react";

import { Recording } from '@/types/recording';
import { audioRecorder, RecordingData } from '@/lib/recorder';
import { getRecordings, saveRecording, deleteRecording as deleteRecordingFromDb } from '@/lib/db';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingDescription, setRecordingDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadData = async () => {
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
    
    loadData();
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  const startRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setTimer(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };
  
  const stopRecording = async () => {
    try {
      if (audioRecorder.isRecording()) {
        const data = await audioRecorder.stopRecording();
        setRecordingData(data);
        setIsRecording(false);
        setShowSaveDialog(true);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
      setIsRecording(false);
    }
  };
  
  const handleSaveRecording = async () => {
    if (!recordingData) return;
    
    try {
      const newRecording = await saveRecording({
        title: recordingTitle || `Recording ${new Date().toLocaleString()}`,
        description: recordingDescription,
        audioUrl: recordingData.url,
        duration: recordingData.duration
      });
      
      setRecordings([newRecording, ...recordings]);
      toast.success("Recording saved");
      setShowSaveDialog(false);
      setRecordingTitle('');
      setRecordingDescription('');
      setRecordingData(null);
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
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

      {isRecording ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-4xl font-mono mb-8">{formatTime(timer)}</div>
          <div className="flex gap-4">
            <Button 
              size="lg"
              variant="destructive"
              className="rounded-full"
              onClick={stopRecording}
            >
              <StopCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-8">
            <h2 className="text-2xl font-bold">My recordings</h2>
            <Button 
              onClick={startRecording}
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
        </>
      )}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Recording</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Slider
                defaultValue={[0]}
                max={100}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm">
                <span>00:10</span>
                <span>-01:20</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center my-4">
              <Button variant="secondary" size="icon" className="rounded-full">
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" className="rounded-full bg-red-500 hover:bg-red-600">
                <StopCircle className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <RefreshCcw className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            <Input
              placeholder="Recording 1"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={recordingDescription}
              onChange={(e) => setRecordingDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRecording} className="bg-red-500 hover:bg-red-600">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
