
// Audio recording utilities

export interface RecordingData {
  blob: Blob;
  url: string;
  duration: number; 
}

class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.start();
      this.startTime = Date.now();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error starting recording:', error);
      return Promise.reject(error);
    }
  }
  
  stopRecording(): Promise<RecordingData> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        // Stop all tracks from the stream
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve({ blob, url, duration });
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }
  
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      
      // Stop all tracks from the stream
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      this.mediaRecorder = null;
      this.audioChunks = [];
    }
  }
}

// Export singleton instance
export const audioRecorder = new AudioRecorder();
