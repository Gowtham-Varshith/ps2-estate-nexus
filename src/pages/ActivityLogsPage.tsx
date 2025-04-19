
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Search, FilterX, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getActivityLogs } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const ActivityLogsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState(getActivityLogs());
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  
  useEffect(() => {
    document.title = "Activity Logs | PS2 Estate Nexus";
    
    // Redirect non-admin users
    if (currentUser && currentUser.role !== "admin") {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);
  
  // Get unique users from logs
  const uniqueUsers = [...new Set(logs.map(log => log.user))].sort();
  
  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    // Filter by search query
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by action type
    const matchesAction = actionFilter === "all" || log.actionType === actionFilter;
    
    // Filter by user
    const matchesUser = userFilter === "all" || log.user === userFilter;
    
    return matchesSearch && matchesAction && matchesUser;
  });
  
  // Get action type badge class
  const getActionTypeClass = (actionType: string) => {
    switch (actionType) {
      case "create":
        return "bg-green-100 text-green-800";
      case "edit":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "view":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600">Monitor all user activities in the system</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <Select 
            value={actionFilter} 
            onValueChange={setActionFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="view">View</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={userFilter} 
            onValueChange={setUserFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Select Date Range</h4>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span>From</span>
                    <Input
                      type="date"
                      className="col-span-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span>To</span>
                    <Input
                      type="date"
                      className="col-span-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              setSearchQuery("");
              setActionFilter("all");
              setUserFilter("all");
            }}
          >
            <FilterX size={18} />
          </Button>
          
          <div className="flex-1 text-right">
            <Button variant="outline">
              Export Logs
            </Button>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user}</span>
                        <span className="text-xs text-gray-500">{log.userRole}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeClass(log.actionType)}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md break-words">
                        {log.description}
                      </div>
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No activity logs found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default ActivityLogsPage;
