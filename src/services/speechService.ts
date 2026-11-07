/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Speech Recognition & Audio Recording Service with clean STT hooks

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
}

export class SpeechService {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening: boolean = false;
  private isRecordingAudio: boolean = false;
  private stream: MediaStream | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (payload: SpeechRecognitionResultPayload) => void,
    onError?: (error: any) => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError(new Error('SpeechRecognition is not supported on this browser.'));
      return false;
    }

    try {
      this.isListening = true;
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        onResult({
          transcript: finalTranscript || interimTranscript,
          isFinal: Boolean(finalTranscript)
        });
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (onError) onError(event);
      };

      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      this.isListening = false;
    }
  }

  public async startAudioRecording(
    onVolumeChange?: (volume: number) => void
  ): Promise<boolean> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;

      // Audio volume analysis for visualizer
      if (onVolumeChange && typeof AudioContext !== 'undefined') {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!this.isRecordingAudio) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((average / 128) * 100));
            onVolumeChange(normalized);
            requestAnimationFrame(checkVolume);
          };
          requestAnimationFrame(checkVolume);
        } catch (e) {
          console.warn('AudioContext volume meter initialization skipped:', e);
        }
      }

      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isRecordingAudio = true;
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or error accessing media device:', err);
      return false;
    }
  }

  public async stopAudioRecording(): Promise<{ audioBlob: Blob; audioUrl: string } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecordingAudio) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.isRecordingAudio = false;

        // Clean up tracks
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
          this.stream = null;
        }

        resolve({ audioBlob, audioUrl });
      };

      this.mediaRecorder.stop();
    });
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecordingAudio;
  }
}

export const speechService = new SpeechService();
