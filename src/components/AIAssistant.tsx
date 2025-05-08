import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, ArrowRight, Activity, FileText, Database, VolumeX, Volume2, Key } from 'lucide-react';
import { SystemStatus } from '@/types/equipment';
import { speak, stopSpeaking, getVoices } from '@/utils/textToSpeech';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  getGeminiApiKey, 
  setGeminiApiKey, 
  hasGeminiApiKey, 
  generateGeminiResponse,
  MessageRole,
  GeminiMessage 
} from '@/utils/geminiAPI';

// Simulated system status for the AI assistant
const simulatedSystemStatus: SystemStatus = {
  equipmentStatus: {
    'pump-001': {
      id: 'pump-001',
      name: 'Primary Pump',
      type: 'pump',
      status: 'running',
      pressure: 1250,
      temperature: 65,
      vibration: 0.8,
      rpm: 1800,
      efficiency: 92,
      operatingHours: 2450,
      lastMaintenance: '2025-04-12',
      maintenanceDue: 7,
      healthScore: 87,
      history: []
    },
    'comp-002': {
      id: 'comp-002',
      name: 'Main Compressor',
      type: 'compressor',
      status: 'running',
      pressure: 850,
      temperature: 72,
      vibration: 1.2,
      rpm: 3600,
      efficiency: 88,
      operatingHours: 1850,
      lastMaintenance: '2025-04-15',
      maintenanceDue: 14,
      healthScore: 92,
      history: []
    }
  },
  activeAlerts: [
    {
      id: 'alert-001',
      equipmentId: 'pump-003',
      timestamp: new Date(),
      message: 'Wellhead temperature exceeding normal range',
      parameter: 'temperature',
      value: 78.2,
      threshold: 75.0,
      priority: 'medium',
      isAcknowledged: false
    }
  ],
  maintenanceSchedule: [
    {
      id: 'maint-001',
      equipmentId: 'pump-001',
      scheduledDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      type: 'preventive',
      description: 'BOP seal replacement',
      estimatedDuration: 4,
      technicians: ['T. Johnson', 'M. Smith'],
      priority: 'high'
    }
  ]
};

// Define message type for local state management
interface Message {
  role: MessageRole;
  content: string;
}

// Generate context-aware AI responses
const generateAIResponse = (query: string, systemStatus: SystemStatus): string => {
  const lowercaseQuery = query.toLowerCase();
  
  // Safety protocol queries
  if (lowercaseQuery.includes('safety') && lowercaseQuery.includes('protocol')) {
    return 'According to OSHA regulation 1910.119, all personnel must evacuate platform deck C when H2S levels exceed 10ppm. Current protocols require use of breathing apparatus in affected areas.';
  }
  
  // Maintenance queries with context
  if (lowercaseQuery.includes('maintenance')) {
    // Look for equipment-specific maintenance
    if (lowercaseQuery.includes('pump')) {
      const pumpStatus = systemStatus.equipmentStatus['pump-001'];
      return `Next scheduled maintenance for ${pumpStatus.name} is in ${pumpStatus.maintenanceDue} days. The maintenance will include seal replacement based on the current vibration pattern of ${pumpStatus.vibration.toFixed(2)} mm/s, which is ${pumpStatus.vibration > 1.0 ? 'above' : 'within'} normal parameters.`;
    }
    
    // General maintenance query
    const nextMaintenance = systemStatus.maintenanceSchedule.sort((a, b) => 
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
    )[0];
    
    const daysUntilMaintenance = Math.ceil((nextMaintenance.scheduledDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    
    return `Next scheduled maintenance is ${nextMaintenance.type} maintenance for ${systemStatus.equipmentStatus[nextMaintenance.equipmentId]?.name || nextMaintenance.equipmentId} in ${daysUntilMaintenance} days. ${nextMaintenance.description}. Required technicians: ${nextMaintenance.technicians.join(', ')}.`;
  }
  
  // Status queries with contextual data
  if (lowercaseQuery.includes('status')) {
    const criticalEquipment = Object.values(systemStatus.equipmentStatus).filter(eq => 
      eq.status === 'warning' || eq.status === 'failure'
    );
    
    if (criticalEquipment.length > 0) {
      return `ATTENTION: ${criticalEquipment.length} ${criticalEquipment.length === 1 ? 'piece' : 'pieces'} of equipment ${criticalEquipment.length === 1 ? 'requires' : 'require'} attention. ${criticalEquipment.map(eq => `${eq.name} is in ${eq.status.toUpperCase()} state with ${eq.temperature.toFixed(1)}°C temperature and ${eq.vibration.toFixed(2)} mm/s vibration.`).join(' ')}`;
    } else {
      return `All critical systems are operational. There are ${systemStatus.activeAlerts.length} active alerts that should be monitored. The overall system health is good with all equipment operating within normal parameters.`;
    }
  }
  
  // Weather queries with simulated data
  if (lowercaseQuery.includes('weather')) {
    return 'Current weather conditions: Wind 15 knots NE, Wave height 1.8m, Visibility 8km. Weather warning: Potential storm system approaching in 36 hours.';
  }
  
  // Emergency queries
  if (lowercaseQuery.includes('emergency')) {
    return '⚠️ EMERGENCY PROTOCOL ACTIVATED. Alerting all supervisors. Please provide exact location and nature of emergency. Dispatching response team to your location.';
  }
  
  // Historical data analysis
  if (lowercaseQuery.includes('historical') || lowercaseQuery.includes('history')) {
    const equipment = lowercaseQuery.includes('compressor') ? 'Main Compressor' : 'Primary Pump';
    return `Historical analysis for ${equipment}: Performance trends show a 3.2% efficiency decrease over the past 30 days. Vibration patterns indicate early signs of bearing wear. Recommendation: Schedule preventive maintenance within the next 14 days to avoid potential failure.`;
  }
  
  // Predictive analysis
  if (lowercaseQuery.includes('predict') || lowercaseQuery.includes('forecast')) {
    return 'Predictive analysis based on current sensor data: The Main Compressor has an 87% probability of requiring maintenance within 21 days. The Secondary Pump shows early warning signs of seal degradation with an estimated 45 days until failure threshold is reached.';
  }
  
  // Default response with guidance
  return 'I can help with information about safety protocols, maintenance schedules, equipment status, historical analysis, and weather conditions. How can I assist you?';
};

const AIAssistant: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Welcome to Vigía AI Assistant. How can I help you today?' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(simulatedSystemStatus);
  const [suggestedQueries, setSuggestedQueries] = useState([
    'What is the current equipment status?',
    'When is the next maintenance scheduled?',
    'Show historical analysis for the primary pump',
    'What are the current safety protocols?'
  ]);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const lastResponseRef = useRef<string>('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Check if API key is missing on component mount
  useEffect(() => {
    if (!hasGeminiApiKey()) {
      // Show API key dialog if no key is found
      setShowApiKeyDialog(true);
    }
  }, []);

  // Initialize speech synthesis voices when component mounts
  useEffect(() => {
    const initVoices = async () => {
      try {
        const voices = await getVoices();
        console.log(`AIAssistant: Loaded ${voices.length} voices`);
        setVoicesLoaded(voices.length > 0);
      } catch (error) {
        console.error('Error initializing voices:', error);
      }
    };
    
    initVoices();
    
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle speech for the latest system message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    // Only speak system messages (AI responses) and only when speech is enabled
    if (lastMessage?.role === 'system' && isSpeechEnabled && lastMessage.content !== lastResponseRef.current) {
      lastResponseRef.current = lastMessage.content;
      console.log('Speaking message:', lastMessage.content);
      speak(lastMessage.content).catch(err => {
        console.error('Speech error:', err);
      });
    }
  }, [messages, isSpeechEnabled]);

  // Update system status periodically to simulate real-time changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => {
        const updated = { ...prev };
        
        // Update equipment readings slightly
        Object.keys(updated.equipmentStatus).forEach(key => {
          const equipment = updated.equipmentStatus[key];
          equipment.temperature += (Math.random() - 0.5) * 0.2;
          equipment.vibration += (Math.random() - 0.5) * 0.05;
          equipment.pressure += (Math.random() - 0.5) * 20;
        });
        
        return updated;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate AI response using Gemini API
  const getAIResponse = async (query: string): Promise<string> => {
    if (!hasGeminiApiKey()) {
      setShowApiKeyDialog(true);
      return "Please provide a Gemini API key to enable AI responses.";
    }
    
    try {
      // Context for Gemini API
      const systemContext = `You are Vigía AI Assistant, an AI assistant for an offshore oil rig safety monitoring system.
      You should respond to queries about equipment status, maintenance schedules, safety protocols, and operational procedures.
      Current system status: ${JSON.stringify(systemStatus)}`;
      
      // Convert chat history to Gemini format
      const geminiMessages: GeminiMessage[] = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add user's new query
      geminiMessages.push({ role: 'user', content: query });
      
      // Call Gemini API
      const response = await generateGeminiResponse(geminiMessages, systemContext);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble connecting to my knowledge base. Please check your API key or try again later.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: inputValue }
    ];
    
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    
    // Stop any ongoing speech when user sends a message
    if (isSpeechEnabled) {
      stopSpeaking();
    }
    
    try {
      // Get AI response from Gemini
      const aiResponse = await getAIResponse(inputValue);
      
      setMessages([
        ...newMessages,
        { role: 'system', content: aiResponse }
      ]);
      
      // Update suggested queries based on the conversation
      if (inputValue.toLowerCase().includes('maintenance')) {
        setSuggestedQueries([
          'What parts are needed for the next maintenance?',
          'Who is assigned to the next maintenance task?',
          'When was the last maintenance performed?',
          'What is the predicted failure date?'
        ]);
      } else if (inputValue.toLowerCase().includes('status')) {
        setSuggestedQueries([
          'Show me detailed alerts for the warning equipment',
          'What is the efficiency trend over the last 24 hours?',
          'Are there any correlated warnings across systems?',
          'What is the current health score of the primary pump?'
        ]);
      }
    } catch (error) {
      // Handle error
      setMessages([
        ...newMessages,
        { role: 'system', content: "I'm sorry, I encountered an error processing your request." }
      ]);
      console.error('Error in AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
  };

  const toggleSpeech = () => {
    if (isSpeechEnabled) {
      stopSpeaking();
    } else {
      // If enabling speech, speak the last message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'system') {
        speak(lastMessage.content).catch(err => {
          console.error('Error speaking last message:', err);
        });
      }
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGeminiApiKey(apiKeyInput.trim());
      setShowApiKeyDialog(false);
      toast.success('Gemini API key saved');
      setApiKeyInput('');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  return (
    <>
      <Card className="bg-vigia-card border-border h-full flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-vigia-teal animate-pulse"></div>
            <h2 className="font-medium">Vigía AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowApiKeyDialog(true)} 
              title="Set Gemini API Key"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSpeech} 
              title={isSpeechEnabled ? "Disable voice responses" : "Enable voice responses"}
            >
              {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
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
          {isTyping && (
            <div className="p-2 rounded-md max-w-[85%] bg-secondary animate-pulse">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-vigia-muted rounded-full"></div>
                <div className="h-2 w-2 bg-vigia-muted rounded-full"></div>
                <div className="h-2 w-2 bg-vigia-muted rounded-full"></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-border">
          <div className="flex flex-wrap gap-1 mb-2">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuery(query)}
                className="text-xs bg-secondary py-1 px-2 rounded-full hover:bg-secondary/80 flex items-center gap-1 transition-colors"
              >
                {index === 0 && <Activity className="h-3 w-3" />}
                {index === 1 && <FileText className="h-3 w-3" />}
                {index === 2 && <Database className="h-3 w-3" />}
                {index === 3 && <Bell className="h-3 w-3" />}
                <span className="truncate max-w-[150px]">{query}</span>
              </button>
            ))}
          </div>
          
          <form 
            onSubmit={handleSubmit} 
            className="flex items-center gap-2"
          >
            <Input 
              placeholder="Ask about safety protocols, maintenance, or status..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-muted border-muted"
            />
            <Button type="submit" size="sm" className="flex-shrink-0">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API Key Required</DialogTitle>
            <DialogDescription>
              Please enter your Gemini API key to enable AI responses. 
              Your key will be stored locally in your browser.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter Gemini API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              You can get a Gemini API key from the Google AI Studio website. The key will be stored in your browser's local storage.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistant;
