
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    devMode: false,
    showRevenue: true,
    showExpenses: true,
    showProfit: currentUser?.role === "admin" || currentUser?.role === "black",
    autoSendWhatsApp: false,
    defaultLanguage: "English",
    templates: {
      thankYou: {
        english: "Thank you for your purchase of plot {{plotNumber}} in {{layout}} layout. We appreciate your business!",
        telugu: "మీరు {{layout}} లేఅవుట్‌లో {{plotNumber}} ప్లాట్‌ను కొనుగోలు చేసినందుకు ధన్యవాదాలు. మీ వ్యాపారాన్ని మేము అభినందిస్తున్నాము!",
        hindi: "{{layout}} लेआउट में {{plotNumber}} प्लॉट खरीदने के लिए धन्यवाद। हम आपके व्यवसाय की सराहना करते हैं!",
        kannada: "{{layout}} ಲೇಔಟ್‌ನಲ್ಲಿ {{plotNumber}} ಪ್ಲಾಟ್ ಖರೀದಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ನಾವು ಪ್ರಶಂಸಿಸುತ್ತೇವೆ!"
      },
      reminder: {
        english: "This is a kind reminder about your payment of ₹{{amount}} due on {{dueDate}} for plot {{plotNumber}}.",
        telugu: "ప్లాట్ {{plotNumber}} కోసం {{dueDate}}న చెల్లించవలసిన ₹{{amount}} చెల్లింపు గురించి ఇది ఒక మంచి రిమైండర్.",
        hindi: "यह प्लॉट {{plotNumber}} के लिए {{dueDate}} को देय ₹{{amount}} के भुगतान के बारे में एक दयालु अनुस्मारक है।",
        kannada: "ಪ್ಲಾಟ್ {{plotNumber}} ಗಾಗಿ {{dueDate}} ರಂದು ₹{{amount}} ಪಾವತಿಯ ಬಗ್ಗೆ ಇದು ಒಂದು ದಯೆಯ ರಿಮೈಂಡರ್."
      }
    }
  });
  
  useEffect(() => {
    document.title = "Settings | PS2 Estate Nexus";
  }, []);
  
  const handleSave = () => {
    // Simulate API call to /api/admin/config/save
    toast.success("Settings saved successfully");
  };
  
  const handleToggle = (field: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };
  
  const handleTemplateChange = (templateType: string, language: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [templateType]: {
          ...prev.templates[templateType as keyof typeof prev.templates],
          [language]: value
        }
      }
    }));
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="messages">Message Templates</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Configuration</CardTitle>
              <CardDescription>Configure metrics and visibility settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Show Revenue Metrics</h4>
                    <p className="text-sm text-gray-500">Display revenue metrics on dashboard</p>
                  </div>
                  <Switch 
                    checked={settings.showRevenue} 
                    onCheckedChange={() => handleToggle('showRevenue')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Show Expense Metrics</h4>
                    <p className="text-sm text-gray-500">Display expense metrics on dashboard</p>
                  </div>
                  <Switch 
                    checked={settings.showExpenses} 
                    onCheckedChange={() => handleToggle('showExpenses')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Show Profit/Loss Analysis</h4>
                    <p className="text-sm text-gray-500">Display profit/loss metrics and charts</p>
                  </div>
                  <Switch 
                    checked={settings.showProfit} 
                    onCheckedChange={() => handleToggle('showProfit')}
                    disabled={currentUser?.role !== "admin" && currentUser?.role !== "black"}
                  />
                </div>
                
                {currentUser?.role !== "admin" && currentUser?.role !== "black" && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    Profit/Loss visibility requires admin privileges
                  </div>
                )}
                
                <div className="pt-4">
                  <Button onClick={handleSave}>Save Dashboard Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Configure WhatsApp message templates for different languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Thank You Messages</h3>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label>English</Label>
                      <Textarea 
                        value={settings.templates.thankYou.english}
                        onChange={(e) => handleTemplateChange('thankYou', 'english', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telugu</Label>
                      <Textarea 
                        value={settings.templates.thankYou.telugu}
                        onChange={(e) => handleTemplateChange('thankYou', 'telugu', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Hindi</Label>
                      <Textarea 
                        value={settings.templates.thankYou.hindi}
                        onChange={(e) => handleTemplateChange('thankYou', 'hindi', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Kannada</Label>
                      <Textarea 
                        value={settings.templates.thankYou.kannada}
                        onChange={(e) => handleTemplateChange('thankYou', 'kannada', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Reminders</h3>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label>English</Label>
                      <Textarea 
                        value={settings.templates.reminder.english}
                        onChange={(e) => handleTemplateChange('reminder', 'english', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telugu</Label>
                      <Textarea 
                        value={settings.templates.reminder.telugu}
                        onChange={(e) => handleTemplateChange('reminder', 'telugu', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Hindi</Label>
                      <Textarea 
                        value={settings.templates.reminder.hindi}
                        onChange={(e) => handleTemplateChange('reminder', 'hindi', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Kannada</Label>
                      <Textarea 
                        value={settings.templates.reminder.kannada}
                        onChange={(e) => handleTemplateChange('reminder', 'kannada', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSave}>Save Message Templates</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system behavior and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Developer Mode</h4>
                    <p className="text-sm text-gray-500">Use mock data and dummy endpoints</p>
                  </div>
                  <Switch 
                    checked={settings.devMode} 
                    onCheckedChange={() => handleToggle('devMode')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Auto-send WhatsApp</h4>
                    <p className="text-sm text-gray-500">Automatically send WhatsApp messages without confirmation</p>
                  </div>
                  <Switch 
                    checked={settings.autoSendWhatsApp} 
                    onCheckedChange={() => handleToggle('autoSendWhatsApp')}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <div className="flex gap-2">
                    {["English", "Telugu", "Hindi", "Kannada"].map(lang => (
                      <Button 
                        key={lang}
                        variant={settings.defaultLanguage === lang ? "default" : "outline"}
                        onClick={() => setSettings(prev => ({ ...prev, defaultLanguage: lang }))}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>WhatsApp API Key</Label>
                  <Input type="password" value="••••••••••••••••" readOnly />
                  <p className="text-xs text-gray-500">Contact administrator to change API key</p>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSave}>Save System Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default SettingsPage;
