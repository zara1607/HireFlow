import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import {
  Send,
  MessageSquare,
  Building,
  User,
  CheckCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/constants';

export const ChatInterface = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherIsTyping, setOtherIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const res = await chatService.getConversations();
        if (res.success) {
          setConversations(res.conversations);

          // If directed here from another page with activeConversationId in state
          const targetId = location.state?.activeConversationId;
          if (targetId) {
            const found = res.conversations.find((c) => c._id === targetId);
            if (found) {
              setActiveConversation(found);
            } else if (res.conversations.length > 0) {
              setActiveConversation(res.conversations[0]);
            }
          } else if (res.conversations.length > 0 && !activeConversation) {
            setActiveConversation(res.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [location.state]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      try {
        const res = await chatService.getMessages(activeConversation._id);
        if (res.success) {
          setMessages(res.messages);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();

    // Join conversation socket room
    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation, socket]);

  // Socket listener for new incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (activeConversation && newMsg.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }

      // Update conversations list preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMsg.conversation
            ? { ...c, lastMessage: newMsg, lastMessageAt: newMsg.createdAt }
            : c
        )
      );
    };

    const handleTyping = (data) => {
      if (
        activeConversation &&
        data.conversationId === activeConversation._id &&
        data.userId !== user._id
      ) {
        setOtherIsTyping(data.isTyping);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, activeConversation, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await chatService.sendMessage(activeConversation._id, text);
      if (res.success && res.message) {
        // Optimistic / returned update
        setMessages((prev) => [...prev, res.message]);
        scrollToBottom();

        // Update list
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, lastMessage: res.message, lastMessageAt: new Date() }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation?.participants?.find((p) => p._id !== user._id) || {};
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-[700px] flex">
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Messages</h3>
          <span className="text-xs font-semibold text-slate-400">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations started yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-3.5 transition flex items-start space-x-3 ${
                    isActive ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {other.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {other.name || 'User'}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {formatTimeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {other.role === 'RECRUITER'
                        ? other.companyName || 'Recruiter'
                        : other.headline || 'Candidate'}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-slate-600 truncate mt-1">
                        {conv.lastMessage.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Chat Stream */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            {(() => {
              const other = getOtherParticipant(activeConversation);
              return (
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {other.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{other.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {other.role === 'RECRUITER'
                          ? other.companyName || 'Recruiter'
                          : other.headline || 'Job Seeker'}
                      </p>
                    </div>
                  </div>
                  {activeConversation.job?.title && (
                    <div className="hidden sm:block text-right">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Job: {activeConversation.job.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">
                    Send a message to start the discussion
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Connect directly regarding opportunities and next steps.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine =
                    (msg.sender?._id || msg.sender).toString() === user._id.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs text-xs ${
                          isMine
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <div
                          className={`text-[10px] mt-1 text-right ${
                            isMine ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {formatTimeAgo(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {otherIsTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-500 italic">
                    typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 bg-white border-t border-slate-200 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No Chat Selected</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Select an ongoing conversation from the left or connect with candidates through the recruiter applicant pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
