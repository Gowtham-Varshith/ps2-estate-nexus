
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Search, Send } from "lucide-react";

const AISearchPage = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  
  // Set page title
  useEffect(() => {
    document.title = "AI Smart Search | PS2 Estate Nexus";
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate AI search with a delay
    setTimeout(() => {
      // Mock results based on search queries
      let mockResults: string[] = [];
      
      if (query.toLowerCase().includes("due")) {
        mockResults = [
          "Plot GV003 has a due payment of ₹2,300,000 from client Jane Smith due on 15 Aug 2023",
          "Plot SH002 has a due payment of ₹1,500,000 from client Robert Miller due on 20 Dec 2023",
        ];
      } else if (query.toLowerCase().includes("bill") || query.toLowerCase().includes("gv002")) {
        mockResults = [
          "Plot GV002 is available in Green Valley layout with 1800 sqft area",
          "The Gov Rate for this plot is ₹2,700,000",
          "Would you like to generate a bill for this plot?",
        ];
      } else if (query.toLowerCase().includes("layout")) {
        mockResults = [
          "There are 4 layouts in the system: Green Valley, Riverside Estate, Skyline Heights, and Meadow Gardens",
          "Green Valley has 120 plots with 35% occupancy",
          "Riverside Estate has 80 plots with 42% occupancy",
        ];
      } else {
        mockResults = [
          "I couldn't find specific information matching your query. Try asking about:",
          "- Due payments (e.g., 'Show all due plots')",
          "- Plot details (e.g., 'Tell me about GV002')",
          "- Layout information (e.g., 'Show layout stats')",
        ];
      }
      
      setResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Smart Search</h1>
        <p className="text-gray-600">Ask questions in natural language to find information</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-ps2-primary focus:border-ps2-primary text-base"
              placeholder="e.g., Show all due plots, Send bill for GV002, Show layout stats..."
              disabled={isSearching}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className={`inline-flex items-center p-1.5 rounded-full ${
                  isSearching || !query.trim()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-ps2-primary hover:bg-blue-50"
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
        
        {isSearching ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ps2-primary"></div>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Results</h2>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">AI Assistant</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {results.map((result, index) => (
                      <p key={index} className="text-gray-800">
                        {result}
                      </p>
                    ))}
                  </div>
                  
                  {query.toLowerCase().includes("gv002") && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button className="px-4 py-2 text-sm text-ps2-primary hover:bg-blue-50 rounded-md">
                          View Plot Details
                        </button>
                        <button className="px-4 py-2 text-sm bg-ps2-primary text-white rounded-md hover:bg-ps2-secondary">
                          Generate Bill
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {query.toLowerCase().includes("due") && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button className="px-4 py-2 text-sm text-ps2-primary hover:bg-blue-50 rounded-md flex items-center">
                          <Send size={16} className="mr-2" />
                          Send WhatsApp Reminder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!results.length && !isSearching && (
              <div className="text-center py-10">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Ask anything about PS2 Estate</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Try asking about due payments, available plots, layout statistics, or specific clients.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Example Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "Show all due plots",
            "Send bill for GV002",
            "Which plots are available in Green Valley?",
            "Show layout statistics",
            "Find clients who purchased in last month",
            "What's the total revenue this year?"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 hover:border-ps2-primary text-sm"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AISearchPage;
