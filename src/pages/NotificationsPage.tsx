
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "@/types/backupTypes";
import { Send, Bell, BellOff, Check, AlertCircle, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [languageOptions] = useState<string[]>(["English", "Telugu", "Hindi", "Kannada"]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    document.title = "Notifications | PS2 Estate Nexus";
    
    // Simulated API call to /api/notifications
    setTimeout(() => {
      // Dummy data
      setNotifications([
        {
          id: 1,
          title: "Tea expense pending confirmation",
          description: "₹250 expense for tea needs your approval",
          date: "2025-04-25",
          read: false,
          type: "warning"
        },
        {
          id: 2,
          title: "Layout PS2 client report ready",
          description: "Monthly client report is ready for review",
          date: "2025-04-24",
          read: false,
          type: "info",
          action: {
            label: "View Report",
            url: "/reports/layout/ps2"
          }
        },
        {
          id: 3,
          title: "New plot sale completed",
          description: "Plot GV003 in PS2 layout has been sold",
          date: "2025-04-23",
          read: true,
          type: "success"
        },
        {
          id: 4,
          title: "Bill payment due tomorrow",
          description: "Reminder for Ravi's payment of ₹25,000",
          date: "2025-04-26",
          read: false,
          type: "warning"
        },
        {
          id: 5,
          title: "Staff payment pending",
          description: "Monthly salary for Venkat is due",
          date: "2025-04-22",
          read: true,
          type: "error"
        },
        {
          id: 6,
          title: "Plot TG004 visit scheduled",
          description: "Client Rajesh will visit tomorrow at 10 AM",
          date: "2025-04-27",
          read: false,
          type: "info"
        },
        {
          id: 7,
          title: "System backup completed",
          description: "Full backup completed successfully",
          date: "2025-04-23",
          read: true,
          type: "success"
        }
      ]);
      
      setLoading(false);
    }, 800);
  }, []);
  
  // Handle WhatsApp send
  const handleWhatsAppSend = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setWhatsappDialogOpen(true);
  };
  
  // Send WhatsApp message
  const sendWhatsAppMessage = () => {
    // Simulate API call to /api/notifications/send
    toast.success(`WhatsApp message sent successfully in ${selectedLanguage}`);
    setWhatsappDialogOpen(false);
    
    // Mark notification as read
    if (selectedNotification) {
      setNotifications(prev => 
        prev.map(n => n.id === selectedNotification.id ? {...n, read: true} : n)
      );
    }
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="text-amber-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-gray-600">Manage all alerts, reminders, and notifications</p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="gap-2">
              <Check size={16} />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <Tabs defaultValue="all">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-4">
              <TabsList className="h-14">
                <TabsTrigger value="all" className="text-sm data-[state=active]:bg-transparent">
                  All
                  <Badge variant="outline" className="ml-2">{notifications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-sm data-[state=active]:bg-transparent">
                  Unread
                  <Badge variant="outline" className="ml-2 bg-blue-50">{unreadCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="text-sm data-[state=active]:bg-transparent">
                  Alerts
                  <Badge variant="outline" className="ml-2 bg-amber-50">{notifications.filter(n => n.type === 'warning' || n.type === 'error').length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="info" className="text-sm data-[state=active]:bg-transparent">
                  Info
                  <Badge variant="outline" className="ml-2 bg-blue-50">{notifications.filter(n => n.type === 'info' || n.type === 'success').length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <CardContent className="p-0">
            <TabsContent value="all">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
                      <p className="text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-4 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-gray-800 flex items-center">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="default" className="ml-2 bg-blue-500 text-[10px]">NEW</Badge>
                              )}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                {new Date(notification.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                {notification.action && (
                                  <a 
                                    href={notification.action.url} 
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    {notification.action.label}
                                  </a>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs whitespace-nowrap h-8"
                                  onClick={() => handleWhatsAppSend(notification)}
                                >
                                  <Send size={12} className="mr-1" />
                                  Send Reminder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    setNotifications(prev => 
                                      prev.map(n => n.id === notification.id ? {...n, read: true} : n)
                                    );
                                  }}
                                >
                                  <Check size={12} className="mr-1" />
                                  Mark Read
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread">
              <div className="divide-y divide-gray-100">
                {notifications.filter(n => !n.read).length === 0 ? (
                  <div className="py-12 text-center">
                    <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">No unread notifications</h3>
                    <p className="text-gray-500 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => !n.read)
                    .map((notification) => (
                      <div 
                        key={notification.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors bg-blue-50"
                      >
                        <div className="flex items-start">
                          <div className="mr-4 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-gray-800 flex items-center">
                              {notification.title}
                              <Badge variant="default" className="ml-2 bg-blue-500 text-[10px]">NEW</Badge>
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                {new Date(notification.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                {notification.action && (
                                  <a 
                                    href={notification.action.url} 
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    {notification.action.label}
                                  </a>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs whitespace-nowrap h-8"
                                  onClick={() => handleWhatsAppSend(notification)}
                                >
                                  <Send size={12} className="mr-1" />
                                  Send Reminder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    setNotifications(prev => 
                                      prev.map(n => n.id === notification.id ? {...n, read: true} : n)
                                    );
                                  }}
                                >
                                  <Check size={12} className="mr-1" />
                                  Mark Read
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="alerts">
              <div className="divide-y divide-gray-100">
                {notifications.filter(n => n.type === 'warning' || n.type === 'error').length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">No alerts</h3>
                    <p className="text-gray-500 mt-1">You have no pending alerts</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => n.type === 'warning' || n.type === 'error')
                    .map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-4 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-gray-800 flex items-center">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="default" className="ml-2 bg-blue-500 text-[10px]">NEW</Badge>
                              )}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                {new Date(notification.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                {notification.action && (
                                  <a 
                                    href={notification.action.url} 
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    {notification.action.label}
                                  </a>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs whitespace-nowrap h-8"
                                  onClick={() => handleWhatsAppSend(notification)}
                                >
                                  <Send size={12} className="mr-1" />
                                  Send Reminder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    setNotifications(prev => 
                                      prev.map(n => n.id === notification.id ? {...n, read: true} : n)
                                    );
                                  }}
                                >
                                  <Check size={12} className="mr-1" />
                                  Mark Read
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="divide-y divide-gray-100">
                {notifications.filter(n => n.type === 'info' || n.type === 'success').length === 0 ? (
                  <div className="py-12 text-center">
                    <Info className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">No information</h3>
                    <p className="text-gray-500 mt-1">You have no informational notifications</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => n.type === 'info' || n.type === 'success')
                    .map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-4 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-gray-800 flex items-center">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="default" className="ml-2 bg-blue-500 text-[10px]">NEW</Badge>
                              )}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                {new Date(notification.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                {notification.action && (
                                  <a 
                                    href={notification.action.url} 
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    {notification.action.label}
                                  </a>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs whitespace-nowrap h-8"
                                  onClick={() => handleWhatsAppSend(notification)}
                                >
                                  <Send size={12} className="mr-1" />
                                  Send Reminder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-xs h-8"
                                  onClick={() => {
                                    setNotifications(prev => 
                                      prev.map(n => n.id === notification.id ? {...n, read: true} : n)
                                    );
                                  }}
                                >
                                  <Check size={12} className="mr-1" />
                                  Mark Read
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* WhatsApp Dialog */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Reminder</DialogTitle>
            <DialogDescription>
              {selectedNotification?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Recipient</div>
                  <div className="text-sm">Suresh (Client)</div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="language" className="text-sm font-medium text-gray-700">Message Language</label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info size={14} className="mr-1" />
                  Auto-detected based on client location
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map(lang => (
                  <Badge 
                    key={lang} 
                    variant={selectedLanguage === lang ? "default" : "outline"}
                    className={`cursor-pointer ${selectedLanguage === lang ? 'bg-blue-500' : ''}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Textarea 
              placeholder="Type your message..."
              className="min-h-[120px]"
              defaultValue={`Regarding ${selectedNotification?.title?.toLowerCase()}. ${selectedNotification?.description} Please confirm at your earliest convenience.`}
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setWhatsappDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendWhatsAppMessage} className="bg-green-600 hover:bg-green-700">
                <Send size={16} className="mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default NotificationsPage;
