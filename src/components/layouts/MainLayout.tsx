
import { useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { 
  Menu, 
  Bell, 
  ChevronDown,
  LogOut,
  Search,
  Send,
  X,
  Loader,
  Sparkles,
  Languages,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { NotificationItem, AISearchResult } from "@/types/backupTypes";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AISearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<string[]>(["English", "Telugu", "Hindi", "Kannada"]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
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
    }
  ]);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format current time (updating every minute)
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  );
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    
    // Simulate API call to /api/search?query=...
    setTimeout(() => {
      // Dummy results based on search query
      if (searchQuery.toLowerCase().includes("expense") || searchQuery.toLowerCase().includes("ps2")) {
        setSearchResults({
          query: searchQuery,
          results: [
            {
              type: 'expense',
              count: 12,
              items: [
                { id: 1, name: "Tea Expenses", amount: 1200, date: "2025-04-21" },
                { id: 2, name: "Labour", amount: 12000, date: "2025-04-20" }
              ]
            },
            {
              type: 'layout',
              count: 1,
              items: [
                { id: 1, name: "PS2 Layout", location: "Guntur" }
              ]
            }
          ],
          suggestion: "Try searching for 'Show all expenses for PS2 in April'",
          totalMatches: 13
        });
      } else if (searchQuery.toLowerCase().includes("client") || searchQuery.toLowerCase().includes("plot")) {
        setSearchResults({
          query: searchQuery,
          results: [
            {
              type: 'client',
              count: 5,
              items: [
                { id: 1, name: "Ramesh Kumar", phone: "9876543210" },
                { id: 2, name: "Suresh Reddy", phone: "8765432109" }
              ]
            },
            {
              type: 'plot',
              count: 8,
              items: [
                { id: 1, name: "GV001", layout: "PS2", status: "Available" },
                { id: 2, name: "GV002", layout: "PS2", status: "Sold" }
              ]
            }
          ],
          suggestion: "Try 'Show all clients who purchased plots in PS2'",
          totalMatches: 13
        });
      } else {
        setSearchResults({
          query: searchQuery,
          results: [
            { type: 'client', count: 3 },
            { type: 'layout', count: 2 },
            { type: 'expense', count: 5 },
            { type: 'bill', count: 4 }
          ],
          suggestion: "Try being more specific with your search",
          totalMatches: 14
        });
      }
      setIsSearching(false);
    }, 800);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };
  
  // Handle WhatsApp send
  const handleWhatsAppSend = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setWhatsappDialogOpen(true);
  };
  
  // Send WhatsApp message
  const sendWhatsAppMessage = () => {
    // Simulate sending API call to /api/whatsapp/send
    toast.success(`WhatsApp message sent successfully in ${selectedLanguage}`);
    setWhatsappDialogOpen(false);
    
    // Mark notification as read
    if (selectedNotification) {
      setNotifications(prev => 
        prev.map(n => n.id === selectedNotification.id ? {...n, read: true} : n)
      );
    }
  };
  
  // Get role style
  const getRoleStyle = () => {
    switch (currentUser?.role) {
      case "admin":
        return "bg-ps2-admin text-white";
      case "black":
        return "bg-ps2-black text-white";
      case "staff":
        return "bg-ps2-white text-ps2-black border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewDetailed = () => {
    if (searchResults) {
      // Simulate navigation to AI search results page
      navigate(`/ai-search?query=${encodeURIComponent(searchQuery)}`);
      clearSearch();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-ps2-primary"
              >
                <Menu size={24} />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">PS2 Estate Nexus</h1>
            </div>
            
            {/* AI-powered Search Bar - Center */}
            <div className="hidden md:flex flex-1 justify-center max-w-3xl mx-4">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative flex items-center w-full">
                  {isSearching ? (
                    <Loader className="absolute left-3 text-blue-500 animate-spin" size={18} />
                  ) : (
                    <Sparkles className="absolute left-3 text-blue-500" size={18} />
                  )}
                  <Input
                    type="text"
                    placeholder="Ask anything or search (e.g., 'Show expenses for PS2')"
                    className="pl-10 pr-10 py-2 w-full focus:border-blue-500 border-blue-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                {/* AI Search Results */}
                {searchResults && (
                  <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg p-4 z-50 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-gray-700">Results for: <span className="text-blue-600">{searchResults.query}</span></div>
                      <Badge variant="outline" className="bg-blue-50">
                        {searchResults.totalMatches} matches
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {searchResults.results.map((result, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold capitalize">{result.type}s</h4>
                            <Badge variant="outline" className="text-xs">{result.count}</Badge>
                          </div>
                          
                          {result.items && (
                            <div className="space-y-2">
                              {result.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="text-xs bg-gray-50 rounded p-2 flex justify-between">
                                  <span>{item.name}</span>
                                  {item.amount && <span className="font-medium">₹{item.amount.toLocaleString()}</span>}
                                  {item.status && <span className={`font-medium ${item.status === 'Sold' ? 'text-green-600' : 'text-blue-600'}`}>{item.status}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {searchResults.suggestion && (
                      <div className="mt-3 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        <span className="font-medium">Suggestion:</span> {searchResults.suggestion}
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={handleViewDetailed}
                        className="text-xs"
                      >
                        View Detailed Results
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="flex items-center">
              {/* Date and Time */}
              <div className="hidden md:flex flex-col items-end mr-6">
                <span className="text-sm font-medium text-gray-600">{currentDate}</span>
                <span className="text-sm text-gray-500">{currentTime}</span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)} 
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ps2-primary relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ps2-danger opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-ps2-danger"></span>
                    </span>
                  )}
                </button>
                
                {/* Notification Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 max-h-[80vh] overflow-y-auto">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0">
                      <h3 className="font-medium text-gray-700">Notifications Center</h3>
                      <Badge variant={unreadCount > 0 ? "info" : "outline"} className="text-xs">
                        {unreadCount} Unread
                      </Badge>
                    </div>
                    
                    <div>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <h4 className="text-sm font-medium text-gray-800 flex items-center">
                                {notification.title}
                                {!notification.read && (
                                  <Badge variant="default" className="ml-2 bg-blue-500 text-[10px]">NEW</Badge>
                                )}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                              <div className="text-xs text-gray-400 mt-2">
                                {new Date(notification.date).toLocaleDateString()}
                              </div>
                              
                              {notification.action && (
                                <a 
                                  href={notification.action.url} 
                                  className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center"
                                >
                                  {notification.action.label}
                                  <ExternalLink size={12} className="ml-1" />
                                </a>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs ml-2 mt-1 whitespace-nowrap"
                              onClick={() => handleWhatsAppSend(notification)}
                            >
                              <Send size={12} className="mr-1" />
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-gray-50 border-t border-gray-200 sticky bottom-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-xs"
                        onClick={() => navigate('/notifications')}
                      >
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <div className="hidden md:block mr-3">
                    <div className="text-sm font-medium text-gray-800">{currentUser?.name}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleStyle()}`}>
                      {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
                    </div>
                  </div>
                  <button className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                      src={currentUser?.avatar || "https://ui-avatars.com/api/?name=User"}
                      alt="User avatar"
                    />
                    <ChevronDown size={16} className="ml-1 text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
      
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
                  <Languages size={14} className="mr-1" />
                  Auto-detected based on location
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
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Attach Documents</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer flex items-center gap-1">
                  <Download size={12} />
                  Brochure
                </Badge>
                <Badge variant="outline" className="cursor-pointer flex items-center gap-1">
                  <Download size={12} />
                  Payment Details
                </Badge>
              </div>
            </div>
            
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
    </div>
  );
};

export default MainLayout;
