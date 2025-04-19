
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { Mic, StopCircle, Play, Trash2, Save, Music } from "lucide-react";

import { Recording } from '@/types/recording';
import { audioRecorder, RecordingData } from '@/lib/recorder';
import { getRecordings, saveRecording, deleteRecording as deleteRecordingFromDb } from '@/lib/db';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load recordings on component mount
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
  
  const startRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      toast.success("Recording started");
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
        audioUrl: recordingData.url,
        duration: recordingData.duration
      });
      
      setRecordings([newRecording, ...recordings]);
      toast.success("Recording saved");
      setShowSaveDialog(false);
      setRecordingTitle('');
      setRecordingData(null);
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
    }
  };
  
  const handleDeleteRecording = async (id: number) => {
    try {
      const success = await deleteRecordingFromDb(id);
      
      if (success) {
        setRecordings(recordings.filter(rec => rec.id !== id));
        
        if (selectedRecording?.id === id) {
          setSelectedRecording(null);
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
        
        toast.success("Recording deleted");
      } else {
        toast.error('Failed to delete recording');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };
  
  const playRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    // In a real app, we'd use the audioRef to control playback
    if (audioRef.current) {
      audioRef.current.src = recording.audioUrl;
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error('Failed to play recording');
      });
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Voice Notes Keeper</h1>
        </div>
        <p className="text-muted-foreground">Record and manage your voice notes easily</p>
      </header>

      <Card className="mb-8">
        <CardContent className="flex justify-center p-6">
          <Button
            size="lg"
            className={`rounded-full px-8 py-6 text-lg ${isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <StopCircle className="h-6 w-6 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-6 w-6 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Recordings</CardTitle>
              <CardDescription>
                {recordings.length === 0 
                  ? "You don't have any recordings yet. Start recording now!"
                  : `You have ${recordings.length} recording(s)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {recordings.length > 0 ? (
                  <div className="space-y-4">
                    {recordings.map((recording) => (
                      <div 
                        key={recording.id} 
                        className={`p-4 rounded-lg flex items-center justify-between ${
                          selectedRecording?.id === recording.id 
                            ? 'bg-muted' 
                            : 'bg-card hover:bg-muted/50'
                        } cursor-pointer transition-colors`}
                        onClick={() => playRecording(recording)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              <Music className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{recording.title}</h3>
                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                              <span>{formatDuration(recording.duration)}</span>
                              <span>•</span>
                              <span>{recording.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              playRecording(recording);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecording(recording.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No recordings found</p>
                    <p className="text-sm mt-2">
                      Click the record button to get started
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedRecording && (
            <Card>
              <CardHeader>
                <CardTitle>Now Playing</CardTitle>
                <CardDescription>{selectedRecording.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-4 flex items-center justify-center">
                    <Music className="h-16 w-16 text-primary/60" />
                  </div>
                  <audio 
                    ref={audioRef} 
                    controls 
                    className="w-full" 
                    src={selectedRecording.audioUrl}
                  />
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0:00</span>
                    <span>{formatDuration(selectedRecording.duration)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Recording</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter recording title"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRecording}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
