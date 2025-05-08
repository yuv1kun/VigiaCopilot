
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to Vigía AI Assistant. How can I help you today?' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { role: 'user', content: inputValue }
    ];
    
    setMessages(newMessages);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const responses = {
        'safety protocol': 'According to OSHA regulation 1910.119, all personnel must evacuate platform deck C when H2S levels exceed 10ppm. Current protocols require use of breathing apparatus in affected areas.',
        'maintenance': 'Next scheduled BOP maintenance is in 7 days. Predictive analysis suggests seal replacement might be required based on pressure fluctuation patterns detected in the last 24 hours.',
        'status': 'All critical systems are operational. There are 2 warning alerts on wellhead temperature and pipe corrosion rate that should be monitored.',
        'weather': 'Current weather conditions: Wind 15 knots NE, Wave height 1.8m, Visibility 8km. Weather warning: Potential storm system approaching in 36 hours.',
        'emergency': '⚠️ EMERGENCY PROTOCOL ACTIVATED. Alerting all supervisors. Please provide exact location and nature of emergency. Dispatching response team to your location.'
      };
      
      let responseText = 'I can help with information about safety protocols, maintenance schedules, system status, and weather conditions. How can I assist you?';
      
      // Check for keywords in the user message
      const userMessage = inputValue.toLowerCase();
      
      Object.entries(responses).forEach(([keyword, response]) => {
        if (userMessage.includes(keyword)) {
          responseText = response;
        }
      });
      
      setMessages([
        ...newMessages,
        { role: 'system', content: responseText }
      ]);
    }, 1000);
  };

  return (
    <Card className="bg-vigia-card border-border h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-vigia-teal animate-pulse-slow"></div>
          <h2 className="font-medium">Vigía AI Assistant</h2>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-md max-w-[85%] ${
              message.role === 'user' 
                ? 'ml-auto bg-vigia-teal text-black' 
                : 'bg-secondary'
            } animate-fade-in`}
          >
            {message.content}
          </div>
        ))}
      </div>
      
      <form 
        onSubmit={handleSubmit} 
        className="p-3 border-t border-border flex items-center gap-2"
      >
        <Input 
          placeholder="Ask about safety protocols, maintenance, or status..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-muted border-muted"
        />
        <Button type="submit" size="sm">Send</Button>
      </form>
    </Card>
  );
};

export default AIAssistant;
