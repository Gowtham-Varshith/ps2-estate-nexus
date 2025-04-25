
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, HardDrive, Cloud, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { getBackupLogs } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BackupType, BackupStatus, BackupLog } from "@/types/backupTypes";
import { Textarea } from "@/components/ui/textarea";

const BackupPage = () => {
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupNotes, setBackupNotes] = useState("");
  const { toast } = useToast();

  // Fetch backup logs
  useEffect(() => {
    // Fetch backup logs from mock data
    const logs = getBackupLogs();
    setBackupLogs(logs);
    
    // Set page title
    document.title = "Backup System | PS2 Estate Nexus";
  }, []);

  // Handle backup now
  const handleBackupNow = () => {
    setIsBackingUp(true);
    
    // Simulate backup process
    setTimeout(() => {
      // Generate new backup log
      const newBackup: BackupLog = {
        id: backupLogs.length + 1,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: BackupType.FULL,
        status: BackupStatus.COMPLETED,
        size: "320 MB",
        user: "Current User"
      };
      
      // Add to logs
      setBackupLogs([newBackup, ...backupLogs]);
      
      // Show success toast
      toast({
        title: "Backup Completed",
        description: "Your backup has been completed successfully.",
      });
      
      setIsBackingUp(false);
    }, 3000);
  };
  
  // Get status badge
  const getStatusBadge = (status: BackupStatus) => {
    switch (status) {
      case BackupStatus.COMPLETED:
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle size={16} className="mr-1" />
            <span>Completed</span>
          </div>
        );
      case BackupStatus.PENDING:
        return (
          <div className="flex items-center text-amber-600">
            <Clock size={16} className="mr-1" />
            <span>Pending</span>
          </div>
        );
      case BackupStatus.FAILED:
        return (
          <div className="flex items-center text-red-600">
            <AlertTriangle size={16} className="mr-1" />
            <span>Failed</span>
          </div>
        );
      case BackupStatus.IN_PROGRESS:
        return (
          <div className="flex items-center text-blue-600">
            <Clock size={16} className="mr-1" />
            <span>In Progress</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };
  
  // Get type icon
  const getTypeIcon = (type: BackupType) => {
    switch (type) {
      case BackupType.LOCAL:
        return <HardDrive size={16} className="mr-1" />;
      case BackupType.EXTERNAL:
        return <Database size={16} className="mr-1" />;
      case BackupType.CLOUD:
        return <Cloud size={16} className="mr-1" />;
      default:
        return <Database size={16} className="mr-1" />;
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Backup System</h1>
        <p className="text-gray-600">Manage and monitor your data backups</p>
      </div>
      
      {/* Backup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center mb-4 text-ps2-primary">
            <HardDrive className="mr-2" />
            <h3 className="text-lg font-semibold">Local Backup</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Last backup: {backupLogs.find(log => log.type === BackupType.LOCAL)?.date || "Never"}</p>
          <p className="text-sm text-gray-500 mb-4">Status: {backupLogs.find(log => log.type === BackupType.LOCAL)?.status || "N/A"}</p>
          <Button 
            variant="outline" 
            className="w-full" 
            disabled={isBackingUp}
            onClick={handleBackupNow}
          >
            {isBackingUp ? "Backing up..." : "Backup Now"}
          </Button>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-4 text-ps2-secondary">
            <Database className="mr-2" />
            <h3 className="text-lg font-semibold">External Backup</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Last backup: {backupLogs.find(log => log.type === BackupType.EXTERNAL)?.date || "Never"}</p>
          <p className="text-sm text-gray-500 mb-4">Status: {backupLogs.find(log => log.type === BackupType.EXTERNAL)?.status || "N/A"}</p>
          <Button 
            variant="outline" 
            className="w-full" 
            disabled={isBackingUp}
            onClick={handleBackupNow}
          >
            Connect Device
          </Button>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-4 text-ps2-warning">
            <Cloud className="mr-2" />
            <h3 className="text-lg font-semibold">Cloud Backup</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Last backup: {backupLogs.find(log => log.type === BackupType.CLOUD)?.date || "Never"}</p>
          <p className="text-sm text-gray-500 mb-4">Status: {backupLogs.find(log => log.type === BackupType.CLOUD)?.status || "N/A"}</p>
          <Button 
            variant="outline" 
            className="w-full" 
            disabled={isBackingUp}
            onClick={handleBackupNow}
          >
            Sync to Cloud
          </Button>
        </Card>
      </div>
      
      {/* Backup Actions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            className="bg-ps2-primary" 
            disabled={isBackingUp}
            onClick={handleBackupNow}
          >
            <Database className="mr-2" /> Backup All
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-ps2-secondary text-ps2-secondary">
                <Cloud className="mr-2" /> Schedule Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Backup</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Configure automatic backup schedule (Coming Soon)</p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-ps2-danger text-ps2-danger">
                <AlertTriangle className="mr-2" /> Restore Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restore from Backup</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Select a backup point to restore from:</p>
                <div className="max-h-96 overflow-y-auto">
                  {backupLogs
                    .filter(log => log.status === BackupStatus.COMPLETED)
                    .map(log => (
                      <div key={log.id} className="border p-3 rounded-md mb-2 hover:bg-gray-50">
                        <p className="font-medium">{log.date} {log.time}</p>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Size: {log.size}</span>
                          <Button size="sm" variant="outline">Restore</Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="mt-2">
                  <label htmlFor="backup-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Restoration Notes
                  </label>
                  <Textarea
                    id="backup-notes"
                    placeholder="Enter any notes about this restoration..."
                    value={backupNotes}
                    onChange={(e) => setBackupNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Backup Logs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Backup History</h2>
        </div>
        <Tabs defaultValue="all">
          <div className="p-4 bg-gray-50">
            <TabsList className="grid grid-cols-4 sm:w-fit">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="local">Local</TabsTrigger>
              <TabsTrigger value="external">External</TabsTrigger>
              <TabsTrigger value="cloud">Cloud</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupLogs.length > 0 ? (
                    backupLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.date}</TableCell>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getTypeIcon(log.type)}
                            <span>{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.size}</TableCell>
                        <TableCell>{log.user}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No backup logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="local" className="mt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupLogs.filter(log => log.type === BackupType.LOCAL).length > 0 ? (
                    backupLogs
                      .filter(log => log.type === BackupType.LOCAL)
                      .map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.date}</TableCell>
                          <TableCell>{log.time}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.size}</TableCell>
                          <TableCell>{log.user}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No local backup logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="external" className="mt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupLogs.filter(log => log.type === BackupType.EXTERNAL).length > 0 ? (
                    backupLogs
                      .filter(log => log.type === BackupType.EXTERNAL)
                      .map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.date}</TableCell>
                          <TableCell>{log.time}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.size}</TableCell>
                          <TableCell>{log.user}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No external backup logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="cloud" className="mt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupLogs.filter(log => log.type === BackupType.CLOUD).length > 0 ? (
                    backupLogs
                      .filter(log => log.type === BackupType.CLOUD)
                      .map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.date}</TableCell>
                          <TableCell>{log.time}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.size}</TableCell>
                          <TableCell>{log.user}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No cloud backup logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BackupPage;
