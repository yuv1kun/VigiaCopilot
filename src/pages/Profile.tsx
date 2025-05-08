
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchApiKey = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching API key:', error);
        return;
      }

      if (data) {
        setApiKey(data.api_key);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveApiKey = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .upsert(
          { 
            user_id: user.id, 
            api_key: apiKey,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
      
      toast.success('API key saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error saving API key');
    } finally {
      setLoading(false);
    }
  };

  // Removed signOut function and just navigate directly
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your API keys and account settings
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Email:</p>
            <p className="text-sm">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <Button onClick={saveApiKey} disabled={loading}>
                <Save size={16} className="mr-1" />
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely and encrypted
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoBack}>
            Back to Dashboard
          </Button>
          {/* Removed signOut button since we don't have that functionality anymore */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
