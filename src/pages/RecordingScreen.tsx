
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { audioRecorder, RecordingData } from '@/lib/recorder';
import SaveRecordingDialog from '@/components/SaveRecordingDialog';

const RecordingScreen = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
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
  }, [isRecording]);
  
  const startRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setTimer(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please check microphone permissions.");
      navigate('/');
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
      navigate('/');
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

      <SaveRecordingDialog 
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        recordingData={recordingData}
      />
    </div>
  );
};

export default RecordingScreen;
