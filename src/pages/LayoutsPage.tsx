
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { layouts } from "@/data/mockData";
import { Map, Plus, Home, Users, Banknote, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LayoutFormModal from "@/components/layouts/LayoutFormModal";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const LayoutsPage = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  
  // Set page title
  useEffect(() => {
    document.title = "Layouts | PS2 Estate Nexus";
  }, []);
  
  // Filter layouts based on search term
  const filteredLayouts = layouts.filter(
    (layout) =>
      layout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      layout.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLayout = (layoutData: any) => {
    // In a real app, this would make an API call
    console.log('New layout data:', layoutData);
    
    // Show success message
    toast({
      title: "Layout Created",
      description: `Successfully created ${layoutData.name} layout with ${layoutData.plotCount} plots`,
    });
    
    // Close the modal
    setShowCreateModal(false);
  };
  
  return (
    <MainLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real Estate Layouts</h1>
          <p className="text-gray-600 mt-1">Browse and manage property layouts</p>
        </div>
        
        {/* Allow staff, black and admin users to create layouts */}
        {currentUser?.role && ["staff", "black", "admin"].includes(currentUser.role) && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-lg hover:bg-ps2-secondary transition-colors shadow-sm hover:shadow-md"
          >
            <Plus size={20} className="mr-2" />
            Create Layout
          </Button>
        )}
      </div>
      
      {/* Search and Filters Card */}
      <Card className="mb-8 border border-gray-200 shadow-sm">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Layouts
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Map className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  id="search"
                  className="pl-10"
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">All</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Recent</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">High Value</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLayouts.map((layout) => (
          <Card key={layout.id} className="group hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={layout.blueprint || "/placeholder.svg"}
                alt={layout.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-xl font-semibold text-white">{layout.name}</h3>
                <p className="text-white/90 text-sm">{layout.location}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Home className="text-ps2-primary" size={18} />
                  <span className="text-sm text-gray-600">
                    {layout.totalPlots} Plots
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-ps2-primary" size={18} />
                  <span className="text-sm text-gray-600">
                    {layout.id % 2 === 0 ? "60%" : "45%"} Occupied
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Banknote className="text-ps2-primary" size={18} />
                  <span className="text-sm text-gray-900 font-medium">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(layout.govRatePerSqft)}/sqft
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  asChild
                  variant="default"
                  className="w-full bg-ps2-primary hover:bg-ps2-secondary text-white"
                >
                  <Link to={`/layouts/${layout.id}`} className="flex items-center justify-center">
                    View Details
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredLayouts.length === 0 && (
        <Card className="p-8 text-center border border-gray-200">
          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No layouts found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any layouts matching your search criteria. Try adjusting your search or create a new layout.
          </p>
          {currentUser?.role && ["staff", "black", "admin"].includes(currentUser.role) && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-lg hover:bg-ps2-secondary transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Create New Layout
            </Button>
          )}
        </Card>
      )}
      
      {/* Create Layout Modal */}
      <LayoutFormModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSubmit={handleCreateLayout}
      />
    </MainLayout>
  );
};

export default LayoutsPage;
