'use client';

import { getGeminiResponse } from "./gemini";

class VoiceSdk {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private isMicMuted: boolean = false;
  private isSpeakerMuted: boolean = false;
  private config: CompanionConfig | null = null;
  private conversationHistory: CompanionMessage[] = [];
  private eventHandlers: { [key: string]: Function[] } = {};
  private isInitialized: boolean = false;
  private voiceConfig: VoiceConfig = {
    voice: "",
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };

  constructor() {}

  private initializeBrowserApis() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.isInitialized = true;
  }

  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition!.continuous = true;
      this.recognition!.interimResults = true;
      this.recognition!.lang = 'en-US';

      this.recognition!.onstart = () => this.emit('speech-start');

      this.recognition!.onend = () => {
        this.emit('speech-end');
        if (this.isListening && !this.isMicMuted) {
          setTimeout(() => this.recognition?.start(), 100);
        }
      };

      this.recognition!.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.handleUserMessage(finalTranscript.trim());
        }
      };

      this.recognition!.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.emit('error', new Error(`Speech recognition error: ${event.error}`));
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  private async handleUserMessage(transcript: string) {
    if (!this.config) return;

    const userMessage: CompanionMessage = {
      role: 'user',
      content: transcript,
      timestamp: Date.now(),
    };
    this.conversationHistory.push(userMessage);

    this.emit('message', {
      type: 'transcript',
      transcriptType: 'final',
      role: 'user',
      transcript,
      timestamp: userMessage.timestamp,
    });

    try {
      const response = await getGeminiResponse(
        transcript,
        this.config,
        this.conversationHistory
      );

      const assistantMessage: CompanionMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      this.conversationHistory.push(assistantMessage);

      this.emit('message', {
        type: 'transcript',
        transcriptType: 'final',
        role: 'assistant',
        transcript: response,
        timestamp: assistantMessage.timestamp,
      });

      await this.speakText(response);
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      this.emit('error', error);
    }
  }

  public async sendTextMessage(message: string): Promise<void> {
    if (!this.config || !message.trim()) {
      throw new Error('Invalid message or configuration');
    }

    await this.handleUserMessage(message.trim());
  }

  public updateVoiceSettings(settings: VoiceConfig) {
    this.voiceConfig = { ...settings };
    this.emit('voice-settings-updated', this.voiceConfig);
  }

  public getVoiceSettings(): VoiceConfig {
    return { ...this.voiceConfig };
  }

  private async speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isSpeakerMuted || !this.synthesis) {
        resolve();
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = this.synthesis.getVoices();
      let preferredVoice: SpeechSynthesisVoice | null = null;

      // Priority order: user selected voice > config voice > first available
      if (this.voiceConfig.voice) {
        preferredVoice = voices.find((voice) => voice.name === this.voiceConfig.voice) || null;
      }
            
      if (!preferredVoice && voices.length > 0) {
        preferredVoice = voices[0];
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Apply voice settings
      utterance.rate = this.voiceConfig.rate;
      utterance.pitch = this.voiceConfig.pitch;
      utterance.volume = this.voiceConfig.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.emit('speech-start');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.emit('speech-end');
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.emit('speech-end');
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  public async start(config: CompanionConfig) {
    this.initializeBrowserApis();

    this.config = config;
    this.conversationHistory = [];
    this.isListening = true;

    this.emit('call-start');

    const firstMessage = `Hello, let's start the session. Today we'll be talking about ${config.topic}.`;
    const timestamp = Date.now();

    const assistantMessage: CompanionMessage = {
      role: 'assistant',
      content: firstMessage,
      timestamp,
    };
    this.conversationHistory.push(assistantMessage);

    this.emit('message', {
      type: 'transcript',
      transcriptType: 'final',
      role: 'assistant',
      transcript: firstMessage,
      timestamp,
    });

    await this.speakText(firstMessage);

    if (this.recognition && !this.isMicMuted) {
      this.recognition.start();
    }
  }

  public stop() {
    this.isListening = false;

    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isSpeaking = false;

    this.emit('call-end');
  }

  public setMuted(muted: boolean) {
    this.isMicMuted = muted;

    if (muted && this.recognition) {
      this.recognition.stop();
    } else if (!muted && this.recognition && this.isListening) {
      this.recognition.start();
    }
  }

  public isMutedState(): boolean {
    return this.isMicMuted;
  }

  public setSpeakerMuted(muted: boolean) {
    this.isSpeakerMuted = muted;

    if (muted && this.isSpeaking && this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.emit('speech-end');
    }
  }

  public isSpeakerMutedState(): boolean {
    return this.isSpeakerMuted;
  }

  public getConversationHistory(): CompanionMessage[] {
    return [...this.conversationHistory];
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }

  public on(event: string, handler: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  public off(event: string, handler: Function) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter((h) => h !== handler);
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => handler(data));
    }
  }
}

let companionVoiceInstance: VoiceSdk | null = null;

export const getCompanionVoice = (): VoiceSdk => {
  if (!companionVoiceInstance) {
    companionVoiceInstance = new VoiceSdk();
  }
  return companionVoiceInstance;
};

export const companionVoice = getCompanionVoice();