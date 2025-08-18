'use client';

import { useEffect, useRef, useState } from 'react'
import { cn, getSubjectColor } from "@/lib/utils";
import { getCompanionVoice } from "@/lib/voice.sdk";
import Lottie, {LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import { addToSessionHistory } from "@/lib/actions/companion.actions";
import CompanionConversation from './CompanionConversation';
import { VoiceSetting } from './VoiceSetting';
import { MicIcon, MicOffIcon } from 'lucide-react';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface CompanionComponentProps {
    companionId: string;
    subject: string;
    topic: string;
    name: string;
    userName: string;
    style: string;
}

interface Message {
    type: string;
    transcriptType: string;
    role: 'user' | 'assistant';
    transcript: string;
}

const CompanionComponent = ({ 
    companionId, 
    subject, 
    topic, 
    name, 
    userName, 
    style, 
}: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<CompanionMessage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [voiceSettings, setVoiceSettings] = useState<VoiceConfig>({
        voice: "",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
    });

    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const companionVoice = getCompanionVoice();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
            setIsSpeechSupported(supported);
        }
        if(lottieRef) {
            if(isSpeaking) {
                lottieRef.current?.play()
            } else {
                lottieRef.current?.stop()
            }
        }
    }, [isSpeaking, lottieRef])

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            addToSessionHistory(companionId)
        }

        const onMessage = (message: Message) => {
            if(message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage: CompanionMessage = { 
                    role: message.role, 
                    content: message.transcript,
                    timestamp: Date.now()
                }
                setMessages((prev) => [...prev, newMessage])
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => {
            console.log('Error', error);
            if (error.message.includes('not-allowed')) {
                alert('Microphone access is required for voice conversation. Please enable microphone permissions and try again.');
                setCallStatus(CallStatus.FINISHED);
            }
        };

        // NEW: Listen for voice settings updates
        const onVoiceSettingsUpdated = (settings: VoiceConfig) => {
            setVoiceSettings(settings);
        };

        companionVoice.on('call-start', onCallStart);
        companionVoice.on('call-end', onCallEnd);
        companionVoice.on('message', onMessage);
        companionVoice.on('error', onError);
        companionVoice.on('speech-start', onSpeechStart);
        companionVoice.on('speech-end', onSpeechEnd);
        companionVoice.on('voice-settings-updated', onVoiceSettingsUpdated);

        setIsInitialized(true);

        return () => {
            companionVoice.off('call-start', onCallStart);
            companionVoice.off('call-end', onCallEnd);
            companionVoice.off('message', onMessage);
            companionVoice.off('error', onError);
            companionVoice.off('speech-start', onSpeechStart);
            companionVoice.off('speech-end', onSpeechEnd);
            companionVoice.off('voice-settings-updated', onVoiceSettingsUpdated);
        }
    }, [companionId, companionVoice]);

    const toggleMicrophone = () => {
        const currentMutedState = companionVoice.isMutedState();
        companionVoice.setMuted(!currentMutedState);
        setIsMuted(!currentMutedState);
    }

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || callStatus !== CallStatus.ACTIVE) return;

        const userMessage = textInput.trim();
        setTextInput('');

        try {
            await companionVoice.sendTextMessage(userMessage);
        } catch (error) {
            console.error('Failed to send text message:', error);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextSubmit(e);
        }
    }

    // NEW: Handle voice settings change
    const handleVoiceSettingsChange = (settings: VoiceConfig) => {
        setVoiceSettings(settings);
    };

    const handleCall = async () => {
        if (!isInitialized) return;
        
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]);

        try {
            await companionVoice.start({
                subject,
                topic,
                style,
                name
            });
        } catch (error) {
            console.error('Failed to start voice session:', error);
            setCallStatus(CallStatus.FINISHED);
            alert('Failed to start voice session. Please check your microphone permissions and try again.');
        }
    }

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        setTextInput('');
        companionVoice.stop();
    }

    return (
        <div className="flex h-[70vh] gap-4">
            {/* Main Companion Section */}
            <section className="flex flex-col flex-1">
                {!isSpeechSupported && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                        <p className="font-bold">Browser Not Supported</p>
                        <p>Speech recognition is not supported in your current browser. Please use Chrome, Safari, or Edge for the best experience.</p>
                    </div>
                )}
                
                {/* Voice Settings - placed at the top */}
                <div className="flex justify-end mb-4">
                    <VoiceSetting
                        onSettingsChange={handleVoiceSettingsChange}
                        initialSettings={voiceSettings}
                    />
                </div>
                
                <section className="flex p-2 gap-8 max-sm:flex-col">
                    <div className="companion-section">
                        <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject)}}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className="companion-lottie"
                            />
                        </div>

                        {/* Current voice settings display */}
                        {callStatus !== CallStatus.INACTIVE && (
                            <div className="text-xs text-muted-foreground text-center mt-2">
                                Voice: {voiceSettings.voice ? voiceSettings.voice.split(' ')[0] : 'Default'} | 
                                Rate: {voiceSettings.rate.toFixed(1)} | 
                                Pitch: {voiceSettings.pitch.toFixed(1)}
                            </div>
                        )}

                        {/* Microphone Control (only show in voice mode) */}
                        {callStatus === CallStatus.ACTIVE && (
                            <button 
                                className="btn-mic" 
                                onClick={toggleMicrophone}
                            >
                                {isMuted ? <MicOffIcon className="size-12" /> : <MicIcon className="size-12" />}
                            </button>
                        )}

                        {/* Start/End Session Button */}
                        <button 
                            className={cn(
                                'rounded-lg py-2 cursor-pointer transition-colors w-full text-white', 
                                callStatus === CallStatus.ACTIVE ? 'bg-destructive' : 'bg-primary', 
                                callStatus === CallStatus.CONNECTING && 'animate-pulse',
                                !isSpeechSupported && 'opacity-50 cursor-not-allowed'
                            )} 
                            onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                            disabled={!isSpeechSupported || !isInitialized}
                        >
                            {callStatus === CallStatus.ACTIVE
                            ? "End Session"
                            : callStatus === CallStatus.CONNECTING
                                ? 'Connecting'
                            : 'Start Session'
                            }
                        </button>
                    </div>
                </section>
            </section>

            {/* Conversation History Sidebar */}
            <CompanionConversation
                messages={messages}
                callStatus={callStatus}
                name={name}
                userName={userName}
                textInput={textInput}
                setTextInput={setTextInput}
                handleTextSubmit={handleTextSubmit}
                handleKeyPress={handleKeyPress}
                messagesEndRef={messagesEndRef}
            />
        </div>
    )
}

export default CompanionComponent;