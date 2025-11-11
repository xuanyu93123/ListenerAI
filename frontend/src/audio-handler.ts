export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private onStatusUpdate: (status: string) => void;
    private onTextReady: (text: string) => void;
  
    constructor(onStatusUpdate: (status: string) => void, onTextReady: (text: string) => void) {
      this.onStatusUpdate = onStatusUpdate;
      this.onTextReady = onTextReady;
    }
  
    async startRecording() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
  
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
  
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        await this.sendToWhisper(blob);
      };
  
      this.mediaRecorder.start();
      this.onStatusUpdate("Recording...");
    }
  
    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.onStatusUpdate("Stopped");
  
        // Stop all tracks in the stream
        const stream = this.mediaRecorder.stream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  
    private async sendToWhisper(audioBlob: Blob) {
      try {
        console.log('Sending audio to Whisper API...');
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');
  
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: formData
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }
  
        const data = await response.json();
        this.onTextReady(data.text);
      } catch (error) {
        console.error('Error sending audio to Whisper API:', error);
        this.onStatusUpdate('Error');
      }
    }
  }