
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, ArrowRight, Activity, FileText, Database, VolumeX, Volume2, Key, User, AlertTriangle } from 'lucide-react';
import { SystemStatus } from '@/types/equipment';
import { speak, stopSpeaking, getVoices } from '@/utils/textToSpeech';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { useEquipmentStatus } from '@/hooks/useEquipmentStatus';
import { 
  getGeminiApiKey, 
  setGeminiApiKey, 
  hasGeminiApiKey, 
  generateGeminiResponse,
  MessageRole,
  GeminiMessage 
} from '@/utils/geminiAPI';
import { SAFETY_PARAMETERS, SAFETY_THRESHOLDS } from '@/utils/monitoringUtils';

// Define message type for local state management
interface Message {
  role: MessageRole;
  content: string;
}

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Welcome to Vigía AI Assistant. How can I help you today?' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
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
  const [apiKeyExists, setApiKeyExists] = useState(false);
  
  // Connect to real-time monitoring data
  const monitoringData = useRealTimeMonitoring();
  const { equipment } = useEquipmentStatus(true);
  
  // Reference to latest monitoring data for use in response generation
  const liveSystemStatus = useRef<SystemStatus>({
    equipmentStatus: {},
    activeAlerts: [],
    maintenanceSchedule: []
  });

  // Update system status when monitoring data changes
  useEffect(() => {
    // Create simulated system status based on real-time data
    const updatedStatus: SystemStatus = {
      equipmentStatus: {
        'pump-001': {
          id: 'pump-001',
          name: 'Primary Pump',
          type: 'pump',
          status: monitoringData.bopPressure.status === 'alert' ? 'warning' : 'running',
          pressure: parseFloat(monitoringData.bopPressure.value.toFixed(0)),
          temperature: parseFloat(monitoringData.wellheadTemperature.value.toFixed(1)),
          vibration: 0.8 + ((monitoringData.wellheadTemperature.value - 85) * 0.01),
          rpm: 1800 + ((monitoringData.bopPressure.value - 1400) * 0.1),
          efficiency: 92 - ((monitoringData.wellheadTemperature.value - 85) * 0.2),
          operatingHours: 2450,
          lastMaintenance: '2025-04-12',
          maintenanceDue: monitoringData.nextMaintenance.value,
          healthScore: 100 - ((monitoringData.wellheadTemperature.value - 85) * 0.5),
          history: []
        },
        'comp-002': {
          id: 'comp-002',
          name: 'Main Compressor',
          type: 'compressor',
          status: monitoringData.gasDetection.status === 'alert' ? 'warning' : 'running',
          pressure: 850 - ((monitoringData.wellheadTemperature.value - 85) * 2),
          temperature: parseFloat(monitoringData.wellheadTemperature.value.toFixed(1)),
          vibration: 1.2 + ((monitoringData.gasDetection.value - 3) * 0.05),
          rpm: 3600,
          efficiency: 88 - ((monitoringData.gasDetection.value - 3) * 0.8),
          operatingHours: 1850,
          lastMaintenance: '2025-04-15',
          maintenanceDue: monitoringData.nextMaintenance.value + 7,
          healthScore: 92 - ((monitoringData.gasDetection.value - 3) * 1.2),
          history: []
        }
      },
      activeAlerts: [
        {
          id: 'alert-001',
          equipmentId: monitoringData.wellheadTemperature.status === 'alert' ? 'pump-001' : 'pump-003',
          timestamp: new Date(),
          message: `${monitoringData.wellheadTemperature.status === 'alert' ? 'Critical: ' : ''}Wellhead temperature ${monitoringData.wellheadTemperature.formattedValue} exceeding normal range`,
          parameter: 'temperature',
          value: monitoringData.wellheadTemperature.value,
          threshold: SAFETY_THRESHOLDS.wellheadTemperature.warning,
          priority: monitoringData.wellheadTemperature.status === 'alert' ? 'critical' : 'medium',
          isAcknowledged: false
        }
      ],
      maintenanceSchedule: [
        {
          id: 'maint-001',
          equipmentId: 'pump-001',
          scheduledDate: new Date(new Date().getTime() + monitoringData.nextMaintenance.value * 24 * 60 * 60 * 1000),
          type: monitoringData.sealIntegrity.value < 90 ? 'corrective' : 'preventive',
          description: monitoringData.sealIntegrity.value < 90 ? 'Urgent seal replacement' : 'BOP seal replacement',
          estimatedDuration: 4,
          technicians: ['T. Johnson', 'M. Smith'],
          priority: monitoringData.sealIntegrity.value < 85 ? 'high' : 'medium'
        }
      ]
    };
    
    // Update our reference for the live system status
    liveSystemStatus.current = updatedStatus;
  }, [monitoringData, equipment]);

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await hasGeminiApiKey();
      setApiKeyExists(hasKey);
      if (!hasKey && user) {
        setShowApiKeyDialog(true);
      }
    };
    
    checkApiKey();
  }, [user]);

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

  // Generate context-aware AI responses using current monitoring data
  const generateLocalResponse = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    const systemStatus = liveSystemStatus.current;
    
    // Safety protocol queries
    if (lowercaseQuery.includes('safety') && lowercaseQuery.includes('protocol')) {
      return `According to OSHA regulation 1910.119, all personnel must evacuate platform deck C when H2S levels exceed 10ppm. Current H2S levels are at ${monitoringData.gasDetection.formattedValue} (${monitoringData.gasDetection.status} status). Current protocols require use of breathing apparatus in ${monitoringData.gasDetection.value > 5.0 ? 'all affected' : 'high-risk'} areas.`;
    }
    
    // Maintenance queries with context
    if (lowercaseQuery.includes('maintenance')) {
      // Look for equipment-specific maintenance
      if (lowercaseQuery.includes('pump')) {
        const pumpData = systemStatus.equipmentStatus['pump-001'];
        return `Next scheduled maintenance for ${pumpData.name} is in ${monitoringData.nextMaintenance.formattedValue} (${monitoringData.nextMaintenance.status} status). The maintenance will include seal replacement based on the current seal integrity of ${monitoringData.sealIntegrity.formattedValue} and vibration pattern of ${pumpData.vibration.toFixed(2)} mm/s, which is ${pumpData.vibration > 1.0 ? 'above' : 'within'} normal parameters.`;
      }
      
      // General maintenance query
      const nextMaintenance = systemStatus.maintenanceSchedule[0];
      const equipmentId = nextMaintenance.equipmentId;
      const equipmentName = systemStatus.equipmentStatus[equipmentId]?.name || equipmentId;
      
      const daysUntilMaintenance = Math.ceil((nextMaintenance.scheduledDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
      
      return `Next scheduled maintenance is ${nextMaintenance.type} maintenance for ${equipmentName} in ${daysUntilMaintenance} days. ${nextMaintenance.description}. Required technicians: ${nextMaintenance.technicians.join(', ')}. Current seal integrity is at ${monitoringData.sealIntegrity.formattedValue} (${monitoringData.sealIntegrity.status} status).`;
    }
    
    // Status queries with contextual data
    if (lowercaseQuery.includes('status')) {
      // Add real equipment from useEquipmentStatus hook
      const criticalEquipment = equipment.filter(eq => 
        eq.status === 'warning' || eq.status === 'critical'
      );
      
      if (criticalEquipment.length > 0) {
        return `ATTENTION: ${criticalEquipment.length} ${criticalEquipment.length === 1 ? 'piece' : 'pieces'} of equipment ${criticalEquipment.length === 1 ? 'requires' : 'require'} attention. ${criticalEquipment.map(eq => `${eq.name} is in ${eq.status.toUpperCase()} state with a health score of ${eq.healthScore.toFixed(1)}%.`).join(' ')} Additionally, BOP pressure is currently at ${monitoringData.bopPressure.formattedValue} (${monitoringData.bopPressure.status} status).`;
      } else {
        return `All critical systems are operational. Current key readings: BOP pressure at ${monitoringData.bopPressure.formattedValue} (${monitoringData.bopPressure.status} status), wellhead temperature at ${monitoringData.wellheadTemperature.formattedValue} (${monitoringData.wellheadTemperature.status} status), and gas detection at ${monitoringData.gasDetection.formattedValue} (${monitoringData.gasDetection.status} status).`;
      }
    }
    
    // Weather queries with simulated data that varies based on time
    if (lowercaseQuery.includes('weather')) {
      const hour = new Date().getHours();
      const windSpeed = 10 + (Math.sin(hour / 24 * 2 * Math.PI) * 5) + Math.random() * 2;
      const waveHeight = 1.2 + (Math.sin((hour + 3) / 24 * 2 * Math.PI) * 0.6) + Math.random() * 0.3;
      const visibility = 10 - (Math.sin((hour + 6) / 24 * 2 * Math.PI) * 2) - Math.random() * 2;
      
      return `Current weather conditions: Wind ${windSpeed.toFixed(1)} knots ${hour < 12 ? 'NE' : 'SW'}, Wave height ${waveHeight.toFixed(1)}m, Visibility ${Math.max(1, visibility).toFixed(1)}km. ${visibility < 5 ? '⚠️ Low visibility advisory in effect.' : ''} ${waveHeight > 2.0 ? '⚠️ High wave warning.' : ''} Wellhead temperature is currently ${monitoringData.wellheadTemperature.formattedValue} (${monitoringData.wellheadTemperature.trend.direction === 'up' ? 'rising' : monitoringData.wellheadTemperature.trend.direction === 'down' ? 'falling' : 'stable'}).`;
    }
    
    // Emergency queries
    if (lowercaseQuery.includes('emergency')) {
      // Check for actual alerts in the system
      const highPriorityAlerts = systemStatus.activeAlerts.filter(alert => 
        alert.priority === 'high' || alert.priority === 'critical'
      );
      
      if (highPriorityAlerts.length > 0) {
        return `⚠️ EMERGENCY PROTOCOL ACTIVATED. ${highPriorityAlerts.length} high-priority ${highPriorityAlerts.length === 1 ? 'alert has' : 'alerts have'} been detected: ${highPriorityAlerts.map(alert => alert.message).join('; ')}. Current wellhead temperature: ${monitoringData.wellheadTemperature.formattedValue}, gas levels: ${monitoringData.gasDetection.formattedValue}. Please provide exact location and nature of response required.`;
      }
      
      return `⚠️ EMERGENCY PROTOCOL ACTIVATED. Alerting all supervisors. Please provide exact location and nature of emergency. Current BOP pressure is ${monitoringData.bopPressure.formattedValue} (${monitoringData.bopPressure.status} status), wellhead temperature is ${monitoringData.wellheadTemperature.formattedValue} (${monitoringData.wellheadTemperature.status} status).`;
    }
    
    // Historical data analysis
    if (lowercaseQuery.includes('historical') || lowercaseQuery.includes('history')) {
      const equipment = lowercaseQuery.includes('compressor') ? 'Main Compressor' : 'Primary Pump';
      const tempTrend = monitoringData.wellheadTemperature.trend.direction;
      const pressureTrend = monitoringData.bopPressure.trend.direction;
      
      return `Historical analysis for ${equipment}: Performance trends show a ${tempTrend === 'up' ? 'rising' : tempTrend === 'down' ? 'falling' : 'stable'} temperature pattern over the past 30 days. Current temperature is ${monitoringData.wellheadTemperature.formattedValue} with pressure at ${monitoringData.bopPressure.formattedValue} (${pressureTrend === 'up' ? 'rising' : pressureTrend === 'down' ? 'falling' : 'stable'}). Vibration patterns indicate ${monitoringData.sealIntegrity.value < 90 ? 'concerning' : 'normal'} seal integrity at ${monitoringData.sealIntegrity.formattedValue}. Recommendation: Schedule preventive maintenance within the next ${monitoringData.nextMaintenance.formattedValue}.`;
    }
    
    // Predictive analysis
    if (lowercaseQuery.includes('predict') || lowercaseQuery.includes('forecast')) {
      const sealDegradation = 100 - monitoringData.sealIntegrity.value;
      const predictedDaysTillMaintenance = Math.max(1, Math.round(monitoringData.nextMaintenance.value * 0.8));
      const sealFailureDays = Math.max(15, Math.round(45 * monitoringData.sealIntegrity.value / 100));
      
      return `Predictive analysis based on current sensor data: The Main Compressor has a ${100 - Math.round(sealDegradation / 2)}% probability of requiring maintenance within ${predictedDaysTillMaintenance} days. The BOP seal shows ${sealDegradation > 10 ? 'early warning signs of degradation' : 'normal wear patterns'} with an estimated ${sealFailureDays} days until failure threshold is reached. Current wellhead temperature is ${monitoringData.wellheadTemperature.formattedValue}, trending ${monitoringData.wellheadTemperature.trend.direction}.`;
    }
    
    // Default response with guidance
    return `I can help with information about safety protocols, maintenance schedules, equipment status, historical analysis, and weather conditions. Current key readings: BOP pressure at ${monitoringData.bopPressure.formattedValue} (${monitoringData.bopPressure.status}), wellhead temperature at ${monitoringData.wellheadTemperature.formattedValue} (${monitoringData.wellheadTemperature.status}), and gas detection at ${monitoringData.gasDetection.formattedValue} (${monitoringData.gasDetection.status}). How can I assist you today?`;
  };

  // Generate AI response using Gemini API or fall back to local response
  const getAIResponse = async (query: string): Promise<string> => {
    const hasKey = await hasGeminiApiKey();
    if (!hasKey) {
      // Fall back to local response if no API key is available
      console.log("No API key available, using local response generator");
      return generateLocalResponse(query);
    }
    
    try {
      // Context for Gemini API using current live data
      const systemContext = `You are Vigía AI Assistant, an AI assistant for an offshore oil rig safety monitoring system.
      You should respond to queries about equipment status, maintenance schedules, safety protocols, and operational procedures.
      Current system status: ${JSON.stringify(liveSystemStatus.current)}
      
      Current sensor readings:
      - BOP Pressure: ${monitoringData.bopPressure.formattedValue} (${monitoringData.bopPressure.status} status)
      - Wellhead Temperature: ${monitoringData.wellheadTemperature.formattedValue} (${monitoringData.wellheadTemperature.status} status)
      - Gas Detection: ${monitoringData.gasDetection.formattedValue} (${monitoringData.gasDetection.status} status)
      - Seal Integrity: ${monitoringData.sealIntegrity.formattedValue} (${monitoringData.sealIntegrity.status} status)
      - Pipe Corrosion: ${monitoringData.pipeCorrosion.formattedValue} (${monitoringData.pipeCorrosion.status} status)
      - Next Maintenance: ${monitoringData.nextMaintenance.formattedValue} (${monitoringData.nextMaintenance.status} status)
      
      Always include specific current values in your responses. Be precise and reference the most recent data.`;
      
      // Convert chat history to Gemini format
      const geminiMessages: GeminiMessage[] = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add user's new query
      geminiMessages.push({ role: 'user', content: query });
      
      // Call Gemini API with timeout
      const responsePromise = generateGeminiResponse(geminiMessages, systemContext);
      
      // Set a timeout for the API call (8 seconds)
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Gemini API request timed out")), 8000);
      });
      
      // Race between the API call and timeout
      const response = await Promise.race([responsePromise, timeoutPromise]);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to local response generation
      console.log("Falling back to local response generator");
      return generateLocalResponse(query);
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
      // Get AI response from Gemini or fallback
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
      } else if (inputValue.toLowerCase().includes('emergency')) {
        setSuggestedQueries([
          'What is the emergency response protocol?',
          'Show me the evacuation routes',
          'What is the status of safety systems?',
          'Who is the emergency response team leader?'
        ]);
      }
    } catch (error) {
      // Handle error
      setMessages([
        ...newMessages,
        { role: 'system', content: "I'm sorry, I encountered an error processing your request. Please try again or check your connection." }
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

  const saveApiKey = async () => {
    if (apiKeyInput.trim()) {
      setShowApiKeyDialog(false);
      const success = await setGeminiApiKey(apiKeyInput.trim());
      if (success) {
        toast.success('Gemini API key saved');
        setApiKeyExists(true);
      } else {
        toast.error('Failed to save API key');
      }
      setApiKeyInput('');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  // Get an appropriate icon based on system status
  const getStatusIcon = () => {
    const hasAlertStatus = monitoringData.bopPressure.status === 'alert' || 
                         monitoringData.wellheadTemperature.status === 'alert' ||
                         monitoringData.gasDetection.status === 'alert';
                         
    if (hasAlertStatus) {
      return <AlertTriangle className="h-4 w-4 text-vigia-danger animate-pulse" />;
    }
    
    return <Activity className="h-4 w-4 text-vigia-teal" />;
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
            <div className="flex items-center text-xs text-muted-foreground mr-2">
              {getStatusIcon()}
              <span className="ml-1">
                {monitoringData.bopPressure.status === 'alert' || monitoringData.wellheadTemperature.status === 'alert' || monitoringData.gasDetection.status === 'alert' 
                  ? 'Alert status' 
                  : 'System nominal'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToProfile} 
              title="Manage profile and API key"
            >
              <User className="h-4 w-4" />
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
              Your key will be stored securely in your user profile.
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
              You can get a Gemini API key from the Google AI Studio website. The key will be stored securely with your user profile.
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
