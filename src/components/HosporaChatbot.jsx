import { useState, useRef, useEffect } from 'react';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || '';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Hospora AI, an expert B2B Hospitality Consultant and Virtual Concierge on the HOSPORA Hospitality Resource Exchange platform in Pune, Maharashtra, India.
Your mission is to help hotels, banquet halls, caterers, and restaurants:
1. Discover & rent available surplus resources (e.g. banquet chairs, round tables, 4K projectors, sound systems, food warmers/Bain Marie, grand halls).
2. Advise on fair market rental prices in Pune (e.g. ₹20-30/chair/day, ₹50-80/table/day, ₹1,200-1,500/projector/day).
3. Offer strategic negotiation and counter-offer tips for hospitality operators.
4. Explain how Hospora AI matching works (proximity, availability, budget, quantity scoring).
5. Guide users through listing their excess inventory to earn rental revenue.

Keep responses concise, friendly, and practical. You can answer fluently in English, Marathi (मराठी), or Hindi based on the user's language.`;

const INITIAL_MESSAGES = [
  {
    id: 'm-init',
    role: 'assistant',
    text: 'Namaskar! 🙏 I am Hospora AI, your Hospitality Concierge. How can I help your hotel or banquet business with resource rentals, pricing, or negotiations today?',
    time: 'Just now'
  }
];

const SUGGESTED_CHIPS = [
  '🔍 Find 200 Chairs in Pune',
  '💰 Average banquet chair rental rate?',
  '🤝 How to negotiate a counter-offer?',
  '📦 How to list my banquet hall?'
];

export default function HosporaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build messages array for Mistral API
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...newHistory.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text
        }))
      ];

      const res = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 350
        })
      });

      if (!res.ok) {
        throw new Error(`Mistral API Error ${res.status}`);
      }

      const json = await res.json();
      const replyText = json.choices?.[0]?.message?.content || 'I am ready to assist your hospitality business.';

      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      // Friendly fallback
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'I am here to help! You can discover available chairs, tables, and equipment in the "Find Resources" section, or publish your own surplus inventory in "My Resources". How else can I assist?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="hospora-chatbot-root">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-floating-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open Hospora AI Assistant"
        >
          <div className="trigger-icon-wrap">
            <span className="ai-sparkle-icon">✨</span>
            <span className="bot-emoji">🤖</span>
          </div>
          <span className="trigger-label">Hospora AI</span>
          {unreadCount > 0 && <span className="trigger-badge">{unreadCount}</span>}
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <span>🤖</span>
                <span className="online-indicator" title="Mistral AI Connected"></span>
              </div>
              <div>
                <h4>Hospora AI Concierge</h4>
                <small>Powered by Mistral AI · Online 🟢</small>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                type="button"
                className="btn-chat-header-icon"
                onClick={handleClearChat}
                title="Reset Conversation"
              >
                ↺
              </button>
              <button
                type="button"
                className="btn-chat-header-icon"
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Suggested Quick Prompts */}
          <div className="chatbot-chips-bar">
            {SUGGESTED_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="chatbot-chip"
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((m) => {
              const isBot = m.role === 'assistant';
              return (
                <div key={m.id} className={`chatbot-msg-row ${isBot ? 'bot-row' : 'user-row'}`}>
                  {isBot && <div className="msg-bot-avatar">🤖</div>}
                  <div className={`chatbot-msg-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                    <div className="msg-content">{m.text}</div>
                    <small className="msg-timestamp">{m.time}</small>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="chatbot-msg-row bot-row">
                <div className="msg-bot-avatar">🤖</div>
                <div className="chatbot-msg-bubble bot-bubble typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chatbot-input-form"
          >
            <input
              type="text"
              placeholder="Ask anything about resources, pricing, Pune hotels..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
