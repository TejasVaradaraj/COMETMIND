import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { progressService } from '../services/progressService';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your UTD Math Question Generator. I can help you practice math problems. Try asking me to generate questions on topics like:\n\n• Algebra\n• Calculus\n• Linear Algebra\n• Differential Equations\n• Statistics\n• Discrete Math\n\nWhat topic would you like to practice today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content) => {
    const newMessage = {
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const extractTopicFromMessage = (message) => {
    const topics = [
      'algebra', 'calculus', 'linear algebra', 'differential equations',
      'statistics', 'discrete math', 'geometry', 'trigonometry',
      'probability', 'number theory', 'combinatorics'
    ];
    
    const lowerMessage = message.toLowerCase();
    for (const topic of topics) {
      if (lowerMessage.includes(topic)) {
        return topic;
      }
    }
    return 'algebra'; // default topic
  };

  const extractDifficulty = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('easy') || lowerMessage.includes('beginner')) {
      return 'easy';
    } else if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('advanced')) {
      return 'hard';
    }
    return 'medium';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Check if user is asking for a question or providing an answer
      if (currentQuestion && 
          (userMessage.toLowerCase().includes('answer') || 
           userMessage.toLowerCase().includes('solution') ||
           /\d/.test(userMessage))) {
        
        // User is providing an answer
        addMessage('bot', 'Thank you for your answer! Let me provide feedback and save your progress.');
        
        // Save progress (in a real app, you'd evaluate the answer)
        await progressService.saveProgress({
          question: currentQuestion.question,
          user_answer: userMessage,
          correct_answer: 'Answer evaluation would be implemented here',
          is_correct: Math.random() > 0.3, // Random for demo
          topic: currentQuestion.topic,
          difficulty: currentQuestion.difficulty
        });

        setCurrentQuestion(null);
        addMessage('bot', 'Progress saved! Would you like to try another question?');
      } else {
        // Generate a new question
        const topic = extractTopicFromMessage(userMessage);
        const difficulty = extractDifficulty(userMessage);
        
        const response = await aiService.generateQuestion(topic, difficulty, userMessage);
        
        setCurrentQuestion({
          question: response.question,
          topic: response.topic,
          difficulty: response.difficulty
        });
        
        addMessage('bot', response.question);
        addMessage('bot', 'Take your time to solve this problem. When you\'re ready, share your answer and I\'ll provide feedback!');
      }
    } catch (error) {
      addMessage('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    // Simple formatting for mathematical content
    return content.split('\n').map((line, index) => (
      <div key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </div>
    ));
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2 className="chatbot-title">🤖 Math Question Generator</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {formatMessage(message.content)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              Generating your math question... ⚡
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask for a math question or provide your answer..."
          className="chat-input"
          rows="2"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="send-btn"
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;