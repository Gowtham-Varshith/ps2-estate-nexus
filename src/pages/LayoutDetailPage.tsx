
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { layouts, plots, clients, documents, Plot } from "@/data/mockData";
import { 
  Map, 
  Home, 
  FileText, 
  Upload, 
  Download, 
  Edit, 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LayoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"plots" | "documents">("plots");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [govRate, setGovRate] = useState(0);
  
  // Find layout
  const layout = layouts.find((l) => l.id === Number(id));
  
  // Get plots for this layout
  const layoutPlots = plots.filter((plot) => plot.layoutId === Number(id));
  
  // Get documents for this layout
  const layoutDocuments = documents.filter(
    (doc) => doc.type === "layout" && doc.relatedId === Number(id)
  );
  
  // Set page title
  useEffect(() => {
    if (layout) {
      document.title = `${layout.name} | PS2 Estate Nexus`;
      setGovRate(layout.govRatePerSqft);
    }
  }, [layout]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (!layout) {
    return (
      <MainLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Layout not found</h2>
          <p className="text-gray-600 mb-4">
            The layout you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            to="/layouts"
            className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors"
          >
            Back to Layouts
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  const handleSavePriceChange = () => {
    // In a real app, this would call an API to update the price
    // Here we're just simulating the update
    setIsEditingPrice(false);
  };
  
  // Get status badge for plot
  const getStatusBadge = (status: Plot["status"]) => {
    switch (status) {
      case "available":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" /> Available
          </span>
        );
      case "reserved":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <Clock size={14} className="mr-1" /> Reserved
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
            <Clock size={14} className="mr-1" /> Pending
          </span>
        );
      case "sold":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            <XCircle size={14} className="mr-1" /> Sold
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{layout.name}</h1>
            <p className="text-gray-600">{layout.location}</p>
          </div>
          <Link
            to="/layouts"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back to Layouts
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="flex items-center">
            <Map className="h-10 w-10 text-ps2-primary mr-3 p-2 bg-blue-100 rounded-full" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Area</p>
              <p className="text-lg font-semibold">{layout.totalAcres} Acres</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Home className="h-10 w-10 text-ps2-primary mr-3 p-2 bg-blue-100 rounded-full" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Plots</p>
              <p className="text-lg font-semibold">{layout.totalPlots}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            {isEditingPrice ? (
              <div className="flex items-center w-full">
                <div className="mr-2 flex-grow">
                  <label className="text-sm font-medium text-gray-500">Gov Rate per Sqft</label>
                  <div className="flex items-center mt-1">
                    <span className="text-gray-500 mr-1">₹</span>
                    <input
                      type="number"
                      value={govRate}
                      onChange={(e) => setGovRate(Number(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSavePriceChange}
                  className="h-10 px-4 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <FileText className="h-10 w-10 text-ps2-primary mr-3 p-2 bg-blue-100 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Gov Rate per Sqft</p>
                  <div className="flex items-center">
                    <p className="text-lg font-semibold">{formatCurrency(layout.govRatePerSqft)}</p>
                    <button
                      onClick={() => setIsEditingPrice(true)}
                      className="ml-2 text-ps2-primary hover:text-ps2-secondary"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {currentUser?.role !== "staff" && (
          <div className="flex items-center p-3 bg-black text-white rounded-md mt-4">
            <div className="mr-3">
              <p className="text-sm font-medium">Black Rate per Sqft</p>
              <p className="text-lg font-semibold">{formatCurrency(layout.blackRatePerSqft)}</p>
            </div>
            <div className="ml-auto">
              <span className="px-2 py-1 text-xs bg-white text-black rounded">Black Ledger Only</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Blueprint */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Blueprint</h2>
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
          <img
            src={layout.blueprint || "/placeholder.svg"}
            alt={`${layout.name} Blueprint`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("plots")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "plots"
                  ? "border-ps2-primary text-ps2-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Home size={18} className="inline-block mr-2" />
              Plots ({layoutPlots.length})
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "documents"
                  ? "border-ps2-primary text-ps2-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText size={18} className="inline-block mr-2" />
              Documents ({layoutDocuments.length})
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "plots" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Plots</h3>
                {(currentUser?.role === "black" || currentUser?.role === "admin") && (
                  <button className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors">
                    <Plus size={18} className="mr-2" />
                    Add New Plot
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plot No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area (Sqft)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gov Value
                      </th>
                      {(currentUser?.role === "black" || currentUser?.role === "admin") && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Black Value
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {layoutPlots.map((plot) => {
                      const client = plot.clientId 
                        ? clients.find((c) => c.id === plot.clientId) 
                        : null;
                      
                      return (
                        <tr key={plot.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {plot.plotNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {plot.areaInSqft}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(plot.govValue)}
                          </td>
                          {(currentUser?.role === "black" || currentUser?.role === "admin") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(plot.blackValue)}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(plot.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client ? (
                              <Link to={`/clients/${client.id}`} className="text-ps2-primary hover:underline">
                                {client.name}
                              </Link>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/layouts/${layout.id}/plots/${plot.id}`}
                              className="text-ps2-primary hover:text-ps2-secondary mr-3"
                            >
                              <Eye size={18} />
                            </Link>
                            {(plot.status === "available" || currentUser?.role !== "staff") && (
                              <Link
                                to={`/billing/new?plotId=${plot.id}`}
                                className="text-ps2-primary hover:text-ps2-secondary"
                              >
                                <FileText size={18} />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === "documents" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Layout Documents</h3>
                <button className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors">
                  <Upload size={18} className="mr-2" />
                  Upload Document
                </button>
              </div>
              
              {layoutDocuments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                  <p className="text-gray-600 mb-4">
                    There are no documents uploaded for this layout yet.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary transition-colors">
                    <Upload size={18} className="mr-2" />
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {layoutDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-md p-4 flex items-start hover:bg-gray-50">
                      <div className="bg-blue-100 p-2 rounded-md mr-3">
                        <FileText className="h-6 w-6 text-ps2-primary" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate" title={doc.name}>
                          {doc.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex">
                        <button className="text-gray-500 hover:text-ps2-primary p-1" title="Download">
                          <Download size={16} />
                        </button>
                        <button className="text-gray-500 hover:text-red-500 p-1" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default LayoutDetailPage;
