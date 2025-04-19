
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RefreshCcw, StopCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { RecordingData } from '@/lib/recorder';
import { saveRecording } from '@/lib/db';

interface SaveRecordingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordingData: RecordingData | null;
}

const SaveRecordingDialog = ({ open, onOpenChange, recordingData }: SaveRecordingDialogProps) => {
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingDescription, setRecordingDescription] = useState('');
  const navigate = useNavigate();

  const handleSaveRecording = async () => {
    if (!recordingData) return;
    
    try {
      await saveRecording({
        title: recordingTitle || `Recording ${new Date().toLocaleString()}`,
        description: recordingDescription,
        audioUrl: recordingData.url,
        duration: recordingData.duration
      });
      
      toast.success("Recording saved");
      onOpenChange(false);
      navigate('/');
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveRecording} className="bg-red-500 hover:bg-red-600">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRecordingDialog;
