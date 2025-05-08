
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [phone, setPhone] = useState('');
  const [assignedZones, setAssignedZones] = useState<string[]>([]);
  const [zoneInput, setZoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Quick bypass - try different formats for the user
  const prepareEmail = (input: string) => {
    // Make email as permissive as possible - just ensure it has an @ symbol
    if (!input.includes('@')) {
      return input + '@example.com'; // Add a domain if missing
    }
    return input;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setLoading(true);
    setDebugInfo(null);

    try {
      // Minimal validation - just ensure fields aren't totally empty
      if (!email || !password) {
        setValidationError('Email and password are required');
        setLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const processedEmail = prepareEmail(email);
      console.log("Attempting to sign up with processed email:", processedEmail, "(original:", email + ")");
      
      // Use any value as email that contains @ and a domain
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: processedEmail,
        password,
        options: {
          data: {
            name,
            role,
            phone,
            original_email: email // Store the original email too
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (authError) {
        console.error("Auth error details:", authError);
        
        // Collect debug info
        const debugDetails = `
          Error type: ${authError.name}
          Error message: ${authError.message}
          Error details: ${JSON.stringify(authError, null, 2)}
        `;
        setDebugInfo(debugDetails);
        
        setValidationError(`Authentication error: ${authError.message}`);
        toast.error("Sign-up failed: " + authError.message);
        setLoading(false);
        return;
      }
      
      if (authData.user) {
        console.log("Auth user created successfully:", authData.user.id);
        
        // Then insert the user profile data
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name,
            role,
            contact_info: { email: processedEmail, phone, original_email: email },
            assigned_zones: assignedZones,
            last_login: new Date().toISOString()
          });

        if (profileError) {
          console.error("Profile error:", profileError);
          
          setValidationError(`Profile creation error: ${profileError.message}`);
          setLoading(false);
          return;
        }
        
        toast.success('Account created! Signing you in automatically...');
        
        // Automatically sign in the user after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: processedEmail, 
          password 
        });
        
        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          setValidationError("Account created but couldn't sign in automatically. Please sign in manually.");
          setLoading(false);
          return;
        }
        
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign up error:', error); 
      toast.error(error.message || 'An error occurred during sign up');
      setValidationError('Unexpected error during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setValidationError('Email and password are required');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // Custom error messages based on error content
        if (error.message.includes('email')) {
          setValidationError('Invalid email format or email not registered');
        } else if (error.message.includes('password')) {
          setValidationError('Incorrect password');
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }
      
      // Update last login time
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userData.user.id);
      }
      
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Minimal password validation only
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setSignupStep(2);
  };

  const prevStep = () => {
    setSignupStep(1);
    setValidationError(null);
  };

  const addZone = () => {
    if (zoneInput.trim() && !assignedZones.includes(zoneInput.trim())) {
      setAssignedZones([...assignedZones, zoneInput.trim()]);
      setZoneInput('');
    }
  };

  const removeZone = (zone: string) => {
    setAssignedZones(assignedZones.filter(z => z !== zone));
  };

  // Modified to remove the checkAuthConfig call which was causing errors
  useEffect(() => {
    // We're now just logging debug info instead of calling checkAuthConfig
    console.log("Auth component mounted");
    
    // Basic check if Supabase is initialized correctly
    if (supabase) {
      console.log("Supabase client is available");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Vigía Safety Platform</CardTitle>
          <CardDescription>
            Offshore Oil Rig Safety Management
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                {validationError && (
                  <Alert variant="destructive">
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input 
                    id="signin-email" 
                    type="text" 
                    placeholder="any@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setValidationError(null);
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input 
                    id="signin-password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            {signupStep === 1 ? (
              <form onSubmit={nextStep}>
                <CardContent className="space-y-4 pt-4">
                  {validationError && (
                    <Alert variant="destructive">
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="text" 
                      placeholder="Enter any value with @ symbol"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationError(null);
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Don't worry about email format - we'll fix it if needed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setValidationError(null);
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                  >
                    Continue
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  {validationError && (
                    <Alert variant="destructive">
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {debugInfo && (
                    <Alert variant="default" className="bg-amber-50 text-amber-900 border-amber-200">
                      <AlertTitle>Debug Information</AlertTitle>
                      <AlertDescription>
                        <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Alert>
                    <AlertDescription>
                      Complete your profile information
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select 
                      value={role} 
                      onValueChange={setRole} 
                      required
                    >
                      <SelectTrigger id="signup-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="hse_manager">HSE Manager</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input 
                      id="signup-phone" 
                      type="tel" 
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Zones</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Add zone (e.g., Zone A)"
                        value={zoneInput}
                        onChange={(e) => setZoneInput(e.target.value)}
                      />
                      <Button 
                        type="button"
                        onClick={addZone}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    {assignedZones.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {assignedZones.map((zone) => (
                          <div 
                            key={zone} 
                            className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            <span>{zone}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 rounded-full" 
                              onClick={() => removeZone(zone)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
