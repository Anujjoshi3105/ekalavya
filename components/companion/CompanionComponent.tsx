'use client';

import {useEffect, useRef, useState} from 'react'
import {cn, getSubjectColor} from "@/lib/utils";
import {geminiVoice} from "@/lib/gemini.sdk";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import {addToSessionHistory} from "@/lib/actions/companion.actions";
import CompanionConversation from './CompanionConversation';
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
    userImage: string;
    style: string;
    voice: string;
}

interface SavedMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
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
    userImage, 
    style, 
    voice 
}: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isTextMode, setIsTextMode] = useState(false);

    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

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
                const newMessage: SavedMessage = { 
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

        geminiVoice.on('call-start', onCallStart);
        geminiVoice.on('call-end', onCallEnd);
        geminiVoice.on('message', onMessage);
        geminiVoice.on('error', onError);
        geminiVoice.on('speech-start', onSpeechStart);
        geminiVoice.on('speech-end', onSpeechEnd);

        setIsInitialized(true);

        return () => {
            geminiVoice.off('call-start', onCallStart);
            geminiVoice.off('call-end', onCallEnd);
            geminiVoice.off('message', onMessage);
            geminiVoice.off('error', onError);
            geminiVoice.off('speech-start', onSpeechStart);
            geminiVoice.off('speech-end', onSpeechEnd);
        }
    }, [companionId]);

    const toggleMicrophone = () => {
        const currentMutedState = geminiVoice.isMutedState();
        geminiVoice.setMuted(!currentMutedState);
        setIsMuted(!currentMutedState);
    }

    const toggleInputMode = () => {
        setIsTextMode(!isTextMode);
        // If switching to text mode, mute microphone
        if (!isTextMode && callStatus === CallStatus.ACTIVE) {
            geminiVoice.setMuted(true);
            setIsMuted(true);
        }
        // If switching back to voice mode, unmute microphone
        else if (isTextMode && callStatus === CallStatus.ACTIVE) {
            geminiVoice.setMuted(false);
            setIsMuted(false);
        }
        
        // Focus text input when switching to text mode
        if (!isTextMode) {
            setTimeout(() => textInputRef.current?.focus(), 100);
        }
    }

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || callStatus !== CallStatus.ACTIVE) return;

        const userMessage = textInput.trim();
        setTextInput('');

        try {
            // Send text message through the SDK
            await geminiVoice.sendTextMessage(userMessage);
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

    const handleCall = async () => {
        if (!isInitialized) return;
        
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]);

        try {
            await geminiVoice.start({
                subject,
                topic,
                style,
                voice,
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
        setIsTextMode(false);
        setTextInput('');
        geminiVoice.stop();
    }

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
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
            />
        </div>
    )
}

export default CompanionComponent;