'use client';

import { useState, useEffect, useRef } from 'react';
import { useAI } from '@/contexts/AIContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AISupport() {
  const {
    currentSession,
    sessions,
    isLoading,
    isTyping,
    error,
    systemPrompt,
    model,
    language,
    createSession,
    setCurrentSession,
    sendMessage,
    updateSystemPrompt,
    setModel,
    setLanguage,
    getAvailableModels,
    getAvailableLanguages,
    clearError
  } = useAI();

  const [messageInput, setMessageInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(systemPrompt);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Initialize with a session if none exists
  useEffect(() => {
    if (!currentSession && sessions.length === 0 && !isLoading) {
      handleCreateSession();
    }
  }, [currentSession, sessions, isLoading]);

  const handleCreateSession = async () => {
    try {
      await createSession('VTS Support Chat');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentSession || isLoading) return;

    const message = messageInput.trim();
    setMessageInput('');

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateSystemPrompt = async () => {
    try {
      await updateSystemPrompt(tempSystemPrompt);
      setShowConfig(false);
    } catch (error) {
      console.error('Failed to update system prompt:', error);
    }
  };

  const quickQuestions = [
    "How do I set up a geofence?",
    "What alerts should I configure for my fleet?",
    "How can I track fuel consumption?",
    "How do I immobilize a vehicle remotely?",
    "What's the difference between idle and offline status?",
    "How do I generate a vehicle usage report?",
  ];

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="text-red-600">⚠️</div>
              <div>
                <p className="font-medium text-red-800">AI Support Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearError}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Customer Support</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Claude Sonnet 4
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfig(!showConfig)}
                  >
                    ⚙️ Config
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateSession}
                    disabled={isLoading}
                  >
                    + New Chat
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentSession?.messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">👋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Welcome to VTS AI Support!
                      </h3>
                      <p className="text-gray-500 mb-4">
                        I'm here to help you with your Vehicle Tracking System. 
                        Ask me anything about fleet management, vehicle controls, or system features.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-6">
                        {quickQuestions.slice(0, 4).map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left h-auto p-3"
                            onClick={() => setMessageInput(question)}
                          >
                            <span className="text-xs">{question}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSession?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-2 opacity-75`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-bounce">●</div>
                          <div className="animate-bounce delay-100">●</div>
                          <div className="animate-bounce delay-200">●</div>
                          <span className="ml-2 text-sm text-gray-600">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about your VTS system..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || !currentSession}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !messageInput.trim() || !currentSession}
                  >
                    {isLoading ? '🔄' : '📤'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Configuration Panel */}
          {showConfig && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Model</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableModels().map((modelName) => (
                        <SelectItem key={modelName} value={modelName}>
                          {modelName.replace('openrouter/', '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableLanguages().map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">System Prompt</label>
                  <Textarea
                    value={tempSystemPrompt}
                    onChange={(e) => setTempSystemPrompt(e.target.value)}
                    rows={8}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleUpdateSystemPrompt}
                    disabled={isLoading}
                  >
                    Update Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chat History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Button
                      key={session.id}
                      variant={currentSession?.id === session.id ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setCurrentSession(session.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-75 truncate">
                          {session.messages.length} messages
                        </div>
                        <div className="text-xs opacity-50">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQuestions.slice(0, 6).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left h-auto p-3 text-xs"
                    onClick={() => setMessageInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}