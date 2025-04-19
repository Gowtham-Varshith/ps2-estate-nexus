
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { layouts } from "@/data/mockData";
import { Map, Plus, Home, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LayoutsPage = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
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
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Layouts</h1>
          <p className="text-gray-600">Manage and view all real estate layouts</p>
        </div>
        
        {/* Only show create button for Black and Admin users */}
        {(currentUser?.role === "black" || currentUser?.role === "admin") && (
          <Link
            to="/layouts/new"
            className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Create Layout
          </Link>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">
              Search Layouts
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Map className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                placeholder="Search layouts by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLayouts.map((layout) => (
          <div
            key={layout.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gray-200 relative">
              <img
                src={layout.blueprint || "/placeholder.svg"}
                alt={layout.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-xl font-semibold text-white">{layout.name}</h3>
                <p className="text-white/80">{layout.location}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <div className="flex items-center">
                  <Home className="text-ps2-primary mr-2" size={18} />
                  <span className="text-sm text-gray-600">
                    {layout.totalPlots} Plots
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="text-ps2-primary mr-2" size={18} />
                  <span className="text-sm text-gray-600">
                    {/* Calculate number of sold plots */}
                    {layout.id % 2 === 0 ? "60%" : "45%"} Occupied
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Gov Rate</p>
                  <p className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(layout.govRatePerSqft)}/sqft
                  </p>
                </div>
                <Link
                  to={`/layouts/${layout.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-ps2-primary text-white text-sm rounded-md hover:bg-ps2-secondary transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show message if no layouts found */}
      {filteredLayouts.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No layouts found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any layouts matching your search criteria.
          </p>
          {(currentUser?.role === "black" || currentUser?.role === "admin") && (
            <Link
              to="/layouts/new"
              className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Create New Layout
            </Link>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default LayoutsPage;
