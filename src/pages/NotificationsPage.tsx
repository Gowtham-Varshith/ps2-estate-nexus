
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Send, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NotificationItem } from "@/types/backupTypes";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Notifications | PS2 Estate Nexus";
    
    // Simulate API call to fetch notifications
    setTimeout(() => {
      const dummyNotifications: NotificationItem[] = [
        {
          id: 1,
          title: "Payment Due Reminder",
          description: "Payment for Plot A12 in PS2 Layout is due in 3 days",
          date: "2023-05-07",
          status: "unread",
          type: "payment",
          actionLabel: "Send Reminder"
        },
        {
          id: 2,
          title: "Tea Expense Pending Confirmation",
          description: "₹1,200 expense for HTGTA needs verification",
          date: "2023-05-06",
          status: "unread",
          type: "expense",
          actionLabel: "Confirm Expense"
        },
        {
          id: 3,
          title: "Plot Selling Anniversary",
          description: "It's been 1 year since Plot B23 was sold to Ramesh Kumar",
          date: "2023-05-05",
          status: "read",
          type: "reminder",
          actionLabel: "Send Greeting"
        },
        {
          id: 4,
          title: "Document Verification Needed",
          description: "Land records for PS3 Layout require verification",
          date: "2023-05-04",
          status: "read",
          type: "alert",
          actionLabel: "View Documents"
        },
        {
          id: 5,
          title: "Staff Payment Reminder",
          description: "Monthly salary payment for 3 staff members is due tomorrow",
          date: "2023-05-03",
          status: "read",
          type: "payment",
          actionLabel: "Process Payment"
        }
      ];
      
      setNotifications(dummyNotifications);
      setLoading(false);
    }, 800);
  }, []);
  
  const handleSendNotification = (id: number, title: string) => {
    // Simulate API call to send notification
    toast({
      title: "WhatsApp Message Sent",
      description: `Reminder sent for "${title}"`,
    });
    
    // Mark notification as read
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, status: "read" } : notification
      )
    );
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, status: "read" }))
    );
    
    toast({
      title: "All Notifications Marked as Read",
      description: "Your notification center is now clear",
    });
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-blue-100 text-blue-800";
      case "expense":
        return "bg-amber-100 text-amber-800";
      case "reminder":
        return "bg-green-100 text-green-800";
      case "alert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage your alerts and reminders</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => n.status === "unread")}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {notifications.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-1">No Notifications</h3>
                <p className="text-gray-500 max-w-sm">
                  You're all caught up! There are no notifications to display at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`overflow-hidden transition-colors ${
                    notification.status === "unread" ? "border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {notification.status === "unread" && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{notification.description}</p>
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <time dateTime={notification.date}>
                            {new Date(notification.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTypeColor(notification.type)}`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                        
                        <Button 
                          onClick={() => handleSendNotification(notification.id, notification.title)}
                          className="whitespace-nowrap"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {notification.actionLabel || "Send WhatsApp"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default NotificationsPage;
