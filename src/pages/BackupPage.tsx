
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Server, Cloud, Download, Upload, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getBackupLogs, BackupType, BackupStatus } from "@/data/mockData";

interface BackupLog {
  id: number;
  date: string;
  time: string;
  type: BackupType;
  status: BackupStatus;
  size: string;
  user: string;
}

const BackupPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(getBackupLogs());
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  
  useEffect(() => {
    document.title = "Backup System | PS2 Estate Nexus";
  }, []);
  
  const handleTriggerBackup = (type: BackupType) => {
    if (isBackingUp) return;
    
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10) + 1;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          
          // Add a new backup log
          const newLog: BackupLog = {
            id: backupLogs.length + 1,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            type: type,
            status: "success",
            size: `${Math.floor(Math.random() * 100) + 10} MB`,
            user: currentUser?.name || "Unknown",
          };
          
          setBackupLogs([newLog, ...backupLogs]);
          
          toast({
            title: "Backup Completed",
            description: `The ${type} backup was completed successfully.`,
          });
          
          return 100;
        }
        
        return newProgress;
      });
    }, 150);
    
    // Show toast notification
    toast({
      title: "Backup Started",
      description: `Starting ${type} backup process...`,
    });
  };
  
  const handleRestore = (id: number) => {
    // Show confirmation toast
    toast({
      title: "Restore Initiated",
      description: "The system will be restored from the selected backup.",
      variant: "destructive",
    });
  };
  
  // Get status icon based on backup status
  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Backup System</h1>
        <p className="text-gray-600">Manage and restore your data backups</p>
      </div>
      
      {/* Backup Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Local Backup</CardTitle>
                <CardDescription>Internal server storage</CardDescription>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Last Backup</span>
              <span className="font-medium">Today, 09:45 AM</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Backup Size</span>
              <span className="font-medium">245 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600">Healthy</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleTriggerBackup("local")}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <>Processing...</>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Backup Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">External Backup</CardTitle>
                <CardDescription>Secondary storage device</CardDescription>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Server className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Last Backup</span>
              <span className="font-medium">Yesterday, 11:30 PM</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Backup Size</span>
              <span className="font-medium">240 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600">Healthy</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleTriggerBackup("external")}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Backup to External
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Cloud Backup</CardTitle>
                <CardDescription>Secure cloud storage</CardDescription>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Cloud className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Last Backup</span>
              <span className="font-medium">April 17, 08:00 AM</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Backup Size</span>
              <span className="font-medium">238 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-amber-600">Needs Update</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleTriggerBackup("cloud")}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <>Processing...</>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Backup to Cloud
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Backup Progress */}
      {isBackingUp && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Backup in Progress</CardTitle>
            <CardDescription>Please do not close the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Backup Logs and Restore */}
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="logs">Backup Logs</TabsTrigger>
          <TabsTrigger value="restore">Restore Backup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Record of all backup operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.date}</TableCell>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>
                          <span className="capitalize">{log.type}</span>
                        </TableCell>
                        <TableCell>{log.size}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(log.status)}
                            <span className="ml-2 capitalize">{log.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="restore">
          <Card>
            <CardHeader>
              <CardTitle>Restore from Backup</CardTitle>
              <CardDescription>Restore your system to a previous state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupLogs
                      .filter(log => log.status === "success")
                      .map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.date}</TableCell>
                          <TableCell>{log.time}</TableCell>
                          <TableCell>
                            <span className="capitalize">{log.type}</span>
                          </TableCell>
                          <TableCell>{log.size}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Success</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRestore(log.id)}
                              disabled={currentUser?.role !== "admin"}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Restore
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              
              {currentUser?.role !== "admin" && (
                <div className="bg-amber-50 text-amber-800 p-4 mt-4 rounded-md text-sm">
                  <AlertTriangle className="h-5 w-5 inline-block mr-2" />
                  Only administrators can perform restore operations.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default BackupPage;
