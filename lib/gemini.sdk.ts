'use client';

import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!});

export interface GeminiVoiceConfig {
  subject: string;
  topic: string;
  style: string;
  voice?: string;
  name: string;
}

export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class GeminiVoiceSDK {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private isMicMuted: boolean = false;
  private isSpeakerMuted: boolean = false;
  private config: GeminiVoiceConfig | null = null;
  private conversationHistory: GeminiMessage[] = [];
  private eventHandlers: { [key: string]: Function[] } = {};

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition!.continuous = true;
      this.recognition!.interimResults = true;
      this.recognition!.lang = 'en-US';

      this.recognition!.onstart = () => {
        this.emit('speech-start');
      };

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

    // Add user message to history
    const userMessage: GeminiMessage = {
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    };
    this.conversationHistory.push(userMessage);

    // Emit the user message immediately
    this.emit('message', {
      type: 'transcript',
      transcriptType: 'final',
      role: 'user',
      transcript: transcript,
      timestamp: userMessage.timestamp
    });

    try {
      // Get response from Gemini
      const response = await this.getGeminiResponse(transcript);
      
      // Add assistant message to history
      const assistantMessage: GeminiMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      this.conversationHistory.push(assistantMessage);

      // Emit assistant message event
      this.emit('message', {
        type: 'transcript',
        transcriptType: 'final',
        role: 'assistant',
        transcript: response,
        timestamp: assistantMessage.timestamp
      });

      // Always speak the response (unless speaker is muted)
      await this.speakText(response);
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      this.emit('error', error);
    }
  }

  // New public method to send text messages
  public async sendTextMessage(message: string): Promise<void> {
    if (!this.config || !message.trim()) {
      throw new Error('Invalid message or configuration');
    }

    await this.handleUserMessage(message.trim());
  }

  private async getGeminiResponse(userInput: string): Promise<string> {
    if (!this.config) throw new Error('No configuration set');

    const systemPrompt = `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.

Tutor Guidelines:
- Stick to the given topic: "${this.config.topic}" and subject: "${this.config.subject}" and teach the student about it.
- Keep the conversation flowing smoothly while maintaining control.
- From time to time make sure that the student is following you and understands you.
- Break down the topic into smaller parts and teach the student one part at a time.
- Keep your style of conversation "${this.config.style}".
- Keep your responses short, like in a real voice conversation.
- Do not include any special characters in your responses - this is a voice conversation.
- Maximum response length should be 2-3 sentences for natural conversation flow.
- The student may communicate via voice or text - respond naturally to both.`;

    // Build conversation history for context
    const conversationContext = this.conversationHistory
      .slice(-10)
      .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n');

    const prompt = `${systemPrompt}

Previous conversation:
${conversationContext}

Current student message: ${userInput}

Respond as the tutor:`;

    const response = await genAI.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
    return response.text!.trim();
  }

  private async speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isSpeakerMuted) {
        resolve();
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('sarah')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

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

  public async start(config: GeminiVoiceConfig) {
    this.config = config;
    this.conversationHistory = [];
    this.isListening = true;
    
    this.emit('call-start');

    const firstMessage = `Hello, let's start the session. Today we'll be talking about ${config.topic}.`;
    const timestamp = Date.now();
    
    const assistantMessage: GeminiMessage = {
      role: 'assistant',
      content: firstMessage,
      timestamp
    };
    this.conversationHistory.push(assistantMessage);
    
    this.emit('message', {
      type: 'transcript',
      transcriptType: 'final',
      role: 'assistant',
      transcript: firstMessage,
      timestamp
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
    
    this.synthesis.cancel();
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
    
    if (muted && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.emit('speech-end');
    }
  }

  public isSpeakerMutedState(): boolean {
    return this.isSpeakerMuted;
  }

  public getConversationHistory(): GeminiMessage[] {
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
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }
}

export const geminiVoice = new GeminiVoiceSDK();