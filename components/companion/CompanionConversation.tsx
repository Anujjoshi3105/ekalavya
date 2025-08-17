'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface SavedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface CompanionConversationProps {
  messages: SavedMessage[];
  callStatus: 'INACTIVE' | 'CONNECTING' | 'ACTIVE' | 'FINISHED';
  name: string;
  userName: string;
  textInput: string;
  setTextInput: (val: string) => void;
  handleTextSubmit: (e: React.FormEvent) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

const CompanionConversation = ({
  messages,
  callStatus,
  name,
  userName,
  textInput,
  setTextInput,
  handleTextSubmit,
  handleKeyPress,
}: CompanionConversationProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <section className="w-1/3 min-w-[300px] flex flex-col border-l border-gray-200 pl-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Conversation History</h3>
        <p className="text-sm text-gray-600">
          {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-3 pr-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation to see the history here</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg max-w-full',
                  message.role === 'assistant' ? 'bg-muted mr-4' : 'bg-primary/10 ml-4'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {message.role === 'assistant' ? name.split(' ')[0].replace(/[.,]/g, '') : userName}
                  </span>
                  <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

      </div>
        {callStatus === 'ACTIVE' && (
          <form onSubmit={handleTextSubmit} className="w-full bottom-0 sticky bg-background py-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={callStatus !== 'ACTIVE'}
              />
              <button
                type="submit"
                disabled={!textInput.trim() || callStatus !== 'ACTIVE'}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        )}
      {/* Session Status */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              callStatus === 'ACTIVE'
                ? 'bg-green-500'
                : callStatus === 'CONNECTING'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-gray-400'
            )}
          />
          <span className="text-sm text-gray-600">
            {callStatus === 'ACTIVE'
              ? 'Session Active'
              : callStatus === 'CONNECTING'
              ? 'Connecting...'
              : callStatus === 'FINISHED'
              ? 'Session Ended'
              : 'Ready to Start'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default CompanionConversation;
