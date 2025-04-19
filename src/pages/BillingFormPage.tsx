
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { layouts, plots, clients } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const BillingFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plotIdParam = searchParams.get("plotId");
  const { currentUser } = useAuth();
  
  // State for form fields
  const [selectedLayout, setSelectedLayout] = useState<number | "">("");
  const [selectedPlot, setSelectedPlot] = useState<number | "">("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [area, setArea] = useState<number>(0);
  const [govRate, setGovRate] = useState<number>(0);
  const [totalGovValue, setTotalGovValue] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"full" | "advance">("full");
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [includePoundPS2, setIncludePoundPS2] = useState(false);
  
  // Derived states
  const [availablePlots, setAvailablePlots] = useState<typeof plots>([]);
  
  // Set page title
  useEffect(() => {
    document.title = "Generate Bill | PS2 Estate Nexus";
  }, []);
  
  // If plotId is passed in URL, pre-select it
  useEffect(() => {
    if (plotIdParam) {
      const plot = plots.find(p => p.id === Number(plotIdParam));
      if (plot) {
        setSelectedPlot(plot.id);
        setSelectedLayout(plot.layoutId);
        
        // Also set area and rate
        setArea(plot.areaInSqft);
        
        const layout = layouts.find(l => l.id === plot.layoutId);
        if (layout) {
          setGovRate(layout.govRatePerSqft);
        }
      }
    }
  }, [plotIdParam]);
  
  // Update available plots when layout changes
  useEffect(() => {
    if (selectedLayout) {
      const filteredPlots = plots.filter(
        plot => plot.layoutId === selectedLayout && 
               (plot.status === "available" || plot.status === "reserved")
      );
      setAvailablePlots(filteredPlots);
    } else {
      setAvailablePlots([]);
    }
  }, [selectedLayout]);
  
  // Update rate when plot changes
  useEffect(() => {
    if (selectedPlot) {
      const plot = plots.find(p => p.id === selectedPlot);
      if (plot) {
        setArea(plot.areaInSqft);
        
        const layout = layouts.find(l => l.id === plot.layoutId);
        if (layout) {
          setGovRate(layout.govRatePerSqft);
        }
      }
    }
  }, [selectedPlot]);
  
  // Calculate total value when area or rate changes
  useEffect(() => {
    setTotalGovValue(area * govRate);
  }, [area, govRate]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send data to an API
    // For demo, we'll just navigate to the billings table
    navigate("/billing");
  };
  
  // Generate an AI suggestion for notes
  const generateAISuggestion = () => {
    const suggestions = [
      "Payment received by cheque. All documents verified and approved.",
      "Advance payment received. Balance payment due in 30 days.",
      "Client has requested extra documentation. Please follow up.",
      "First-time client. Special discount of 5% applied as per management.",
      "Client is related to VIP customer. Please notify management."
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate Bill</h1>
        <p className="text-gray-600">Create a new bill for plot sale</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Client Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Plot Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Plot Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="layout" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Layout
                  </label>
                  <select
                    id="layout"
                    value={selectedLayout}
                    onChange={(e) => setSelectedLayout(e.target.value ? Number(e.target.value) : "")}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                    required
                    disabled={!!plotIdParam}
                  >
                    <option value="">Select a layout</option>
                    {layouts.map((layout) => (
                      <option key={layout.id} value={layout.id}>
                        {layout.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="plot" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Plot
                  </label>
                  <select
                    id="plot"
                    value={selectedPlot}
                    onChange={(e) => setSelectedPlot(e.target.value ? Number(e.target.value) : "")}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                    required
                    disabled={!selectedLayout || !!plotIdParam}
                  >
                    <option value="">Select a plot</option>
                    {availablePlots.map((plot) => (
                      <option key={plot.id} value={plot.id}>
                        {plot.plotNo} ({plot.areaInSqft} sqft)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Area (Sqft)
                </label>
                <input
                  type="number"
                  id="area"
                  value={area || ""}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="govRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Gov Rate per Sqft
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    id="govRate"
                    value={govRate || ""}
                    readOnly
                    className="block w-full pl-7 border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="totalGovValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Gov Value
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="text"
                    id="totalGovValue"
                    value={totalGovValue.toLocaleString('en-IN')}
                    readOnly
                    className="block w-full pl-7 border-gray-300 rounded-md shadow-sm bg-gray-50 font-medium text-gray-900 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="full"
                      checked={paymentType === "full"}
                      onChange={() => setPaymentType("full")}
                      className="focus:ring-ps2-primary h-4 w-4 text-ps2-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Full Payment</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="advance"
                      checked={paymentType === "advance"}
                      onChange={() => setPaymentType("advance")}
                      className="focus:ring-ps2-primary h-4 w-4 text-ps2-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Advance Payment</span>
                  </label>
                </div>
              </div>
              
              {paymentType === "advance" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="advanceAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Advance Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="advanceAmount"
                        value={advanceAmount || ""}
                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                        className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                        required={paymentType === "advance"}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                      required={paymentType === "advance"}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <div className="relative">
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-ps2-primary focus:border-ps2-primary sm:text-sm"
                ></textarea>
                <button
                  type="button"
                  onClick={() => setNotes(generateAISuggestion())}
                  className="absolute right-2 bottom-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  AI Suggest
                </button>
              </div>
            </div>
            
            {currentUser?.role !== "staff" && (
              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={includePoundPS2}
                    onChange={(e) => setIncludePoundPS2(e.target.checked)}
                    className="focus:ring-ps2-primary h-4 w-4 text-ps2-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include <strong>#PS2</strong> tag (Black Ledger Entry)
                  </span>
                </label>
                {includePoundPS2 && (
                  <div className="mt-2 p-3 bg-black text-white text-sm rounded-md">
                    Adding #PS2 tag will create a black ledger entry. This will not be visible to Staff users.
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ps2-primary mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-ps2-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-ps2-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ps2-primary"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default BillingFormPage;
