'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ChatSession, ChatMessage, ApiResponse } from '@/types';
import { useAuth } from './AuthContext';

interface AIState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  systemPrompt: string;
  model: string;
  language: string;
  isTyping: boolean;
}

interface AIAction {
  type:
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'CLEAR_ERROR'
    | 'SET_SESSIONS'
    | 'ADD_SESSION'
    | 'UPDATE_SESSION'
    | 'SET_CURRENT_SESSION'
    | 'ADD_MESSAGE'
    | 'UPDATE_MESSAGE'
    | 'SET_SYSTEM_PROMPT'
    | 'SET_MODEL'
    | 'SET_LANGUAGE'
    | 'SET_TYPING';
  payload?: any;
}

interface AIContextType extends AIState {
  // Session Management
  createSession: (title?: string) => Promise<ChatSession>;
  loadSessions: () => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Message Management
  sendMessage: (content: string, context?: any) => Promise<void>;
  
  // Configuration
  updateSystemPrompt: (prompt: string) => Promise<void>;
  setModel: (model: string) => void;
  setLanguage: (language: string) => void;
  
  // Utility
  clearError: () => void;
  getAvailableModels: () => string[];
  getAvailableLanguages: () => { code: string; name: string }[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const DEFAULT_SYSTEM_PROMPT = `You are an intelligent customer support assistant for IT GIS Solutions' Vehicle Tracking System (VTS). You provide expert support for fleet management, vehicle tracking, geofencing, alerts, and all VTS features.

Company Information:
- IT GIS Solutions operates across India, Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman
- Comprehensive VTS solution with real-time tracking, security controls, and fleet management
- Multi-tenant system supporting organizations across different regions

Key Features You Support:
1. Real-time vehicle tracking with GPS monitoring
2. Geofencing with entry/exit alerts
3. Vehicle security controls (immobilization, fuel control)
4. SOS emergency systems with SMS notifications
5. Driver behavior monitoring and reporting
6. Fuel consumption tracking and theft detection
7. Maintenance scheduling and alerts
8. Multi-level user management (Super Admin, Admin, Fleet Manager, Customer, Driver)

Your Capabilities:
- Answer questions about VTS features and functionality
- Provide troubleshooting guidance for common issues
- Explain how to configure alerts, geofences, and user settings
- Assist with vehicle management and fleet operations
- Help with report generation and data analysis
- Guide users through mobile app features
- Provide technical support for device installation

Communication Style:
- Professional yet friendly tone
- Clear, step-by-step instructions
- Use region-appropriate terminology and examples
- Offer multiple solutions when possible
- Ask clarifying questions when needed
- Escalate complex technical issues to human support when appropriate

Important: Always prioritize user safety and security. For emergency situations, immediately advise contacting local emergency services.`;

const initialState: AIState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  model: 'openrouter/anthropic/claude-sonnet-4',
  language: 'en',
  isTyping: false,
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    
    case 'ADD_SESSION':
      return { 
        ...state, 
        sessions: [action.payload, ...state.sessions],
        currentSession: action.payload,
      };
    
    case 'UPDATE_SESSION':
      const updatedSessions = state.sessions.map(session =>
        session.id === action.payload.id ? { ...session, ...action.payload } : session
      );
      
      return {
        ...state,
        sessions: updatedSessions,
        currentSession: state.currentSession?.id === action.payload.id 
          ? { ...state.currentSession, ...action.payload }
          : state.currentSession,
      };
    
    case 'SET_CURRENT_SESSION':
      return { 
        ...state, 
        currentSession: action.payload 
          ? state.sessions.find(s => s.id === action.payload) || null
          : null,
      };
    
    case 'ADD_MESSAGE':
      if (!state.currentSession) return state;
      
      const updatedCurrentSession = {
        ...state.currentSession,
        messages: [...state.currentSession.messages, action.payload],
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        currentSession: updatedCurrentSession,
        sessions: state.sessions.map(session =>
          session.id === updatedCurrentSession.id ? updatedCurrentSession : session
        ),
      };
    
    case 'UPDATE_MESSAGE':
      if (!state.currentSession) return state;
      
      const updatedMessages = state.currentSession.messages.map(msg =>
        msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
      );
      
      const sessionWithUpdatedMessage = {
        ...state.currentSession,
        messages: updatedMessages,
      };
      
      return {
        ...state,
        currentSession: sessionWithUpdatedMessage,
        sessions: state.sessions.map(session =>
          session.id === sessionWithUpdatedMessage.id ? sessionWithUpdatedMessage : session
        ),
      };
    
    case 'SET_SYSTEM_PROMPT':
      return { ...state, systemPrompt: action.payload };
    
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    default:
      return state;
  }
}

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();

  // Load sessions on authentication
  React.useEffect(() => {
    if (isAuthenticated && token) {
      loadSessions();
    }
  }, [isAuthenticated, token]);

  const createSession = async (title?: string): Promise<ChatSession> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const sessionData = {
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        userId: user?.id,
        organizationId: user?.organizationId,
      };

      const response = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const result: ApiResponse<ChatSession> = await response.json();
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_SESSION', payload: result.data });
        dispatch({ type: 'SET_LOADING', payload: false });
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Create session error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create chat session' });
      throw error;
    }
  };

  const loadSessions = async (): Promise<void> => {
    try {
      const response = await fetch('/api/ai/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse<ChatSession[]> = await response.json();
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_SESSIONS', payload: result.data });
      } else {
        throw new Error(result.message || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('Load sessions error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load chat sessions' });
    }
  };

  const setCurrentSession = useCallback((sessionId: string | null) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
  }, []);

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/ai/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        dispatch({ 
          type: 'SET_SESSIONS', 
          payload: state.sessions.filter(s => s.id !== sessionId) 
        });
        
        if (state.currentSession?.id === sessionId) {
          dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
        }
      } else {
        throw new Error(result.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Delete session error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete session' });
    }
  };

  const sendMessage = async (content: string, context?: any): Promise<void> => {
    if (!state.currentSession) {
      throw new Error('No active session');
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sessionId: state.currentSession.id,
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: context,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      // Prepare messages for AI API
      const messages = [
        {
          role: 'system',
          content: state.systemPrompt,
        },
        ...state.currentSession.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content,
        },
      ];

      // Call AI API with custom endpoint
      const response = await fetch('https://oi-server.onrender.com/chat/completions', {
        method: 'POST',
        headers: {
          'customerId': 'cus_SylHQr9jj9sCA0',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx',
        },
        body: JSON.stringify({
          model: state.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status}`);
      }

      const aiResponse = await response.json();
      const aiContent = aiResponse.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Add AI message
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        sessionId: state.currentSession.id,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });

      // Save message to database
      await fetch('/api/ai/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: state.currentSession.id,
          messages: [userMessage, aiMessage],
        }),
      });

    } catch (error) {
      console.error('Send message error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        sessionId: state.currentSession.id,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const updateSystemPrompt = async (prompt: string): Promise<void> => {
    try {
      const response = await fetch('/api/ai/system-prompt', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemPrompt: prompt }),
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        dispatch({ type: 'SET_SYSTEM_PROMPT', payload: prompt });
      } else {
        throw new Error(result.message || 'Failed to update system prompt');
      }
    } catch (error) {
      console.error('Update system prompt error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update system prompt' });
    }
  };

  const setModel = useCallback((model: string) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, []);

  const setLanguage = useCallback((language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const getAvailableModels = useCallback(() => {
    return [
      'openrouter/anthropic/claude-sonnet-4',
      'openrouter/openai/gpt-4o',
      'openrouter/google/gemini-pro',
      'openrouter/meta-llama/llama-3.1-70b-instruct',
      'openrouter/anthropic/claude-haiku',
    ];
  }, []);

  const getAvailableLanguages = useCallback(() => {
    return [
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'العربية (Arabic)' },
      { code: 'hi', name: 'हिन्दी (Hindi)' },
      { code: 'ur', name: 'اردو (Urdu)' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
    ];
  }, []);

  const contextValue: AIContextType = {
    ...state,
    createSession,
    loadSessions,
    setCurrentSession,
    deleteSession,
    sendMessage,
    updateSystemPrompt,
    setModel,
    setLanguage,
    clearError,
    getAvailableModels,
    getAvailableLanguages,
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

// Hook for quick AI assistance
export function useQuickAI() {
  const { sendMessage, createSession, currentSession } = useAI();
  
  const quickAsk = async (question: string, context?: any) => {
    if (!currentSession) {
      await createSession('Quick Support');
    }
    
    return sendMessage(question, context);
  };
  
  return { quickAsk };
}