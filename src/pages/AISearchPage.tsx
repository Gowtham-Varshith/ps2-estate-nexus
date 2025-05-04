
import React, { useState } from 'react';
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileType, Table, BarChart, LineChart, Download } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { AISearchResult } from '@/types/backupTypes';

const AISearchPage = () => {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultType, setResultType] = useState<'table' | 'chart' | 'report'>('table');

  const dummySearchExamples = [
    "Show expenses for PS2",
    "List all plots sold in April",
    "Show tea expenses from Mon-Fri",
    "Generate report for PS2 in April",
    "Calculate profit from Layout PS3"
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate dummy results based on query
      const searchTerm = query.toLowerCase();
      
      if (searchTerm.includes('report') || searchTerm.includes('generate')) {
        setResultType('report');
      } else if (searchTerm.includes('chart') || searchTerm.includes('graph') || searchTerm.includes('profit')) {
        setResultType('chart');
      } else {
        setResultType('table');
        
        // Generate dummy search results
        const dummyResults: AISearchResult[] = [];
        
        if (searchTerm.includes('expense') || searchTerm.includes('tea') || searchTerm.includes('cost')) {
          dummyResults.push(
            { type: 'expense', id: 1, name: 'Tea Expenses', description: 'Daily tea expenses for staff', matchScore: 0.95 },
            { type: 'expense', id: 2, name: 'HTGTA Tea Supplier', description: 'Monthly bulk tea purchase', matchScore: 0.88 },
            { type: 'expense', id: 3, name: 'Transport to Tea Estate', description: 'Travel expenses', matchScore: 0.72 }
          );
        }
        
        if (searchTerm.includes('ps2') || searchTerm.includes('layout')) {
          dummyResults.push(
            { type: 'layout', id: 1, name: 'PS2 Layout', description: 'Premium residential layout', matchScore: 0.94 },
            { type: 'plot', id: 2, name: 'PS2-A12', description: 'Corner plot in PS2', matchScore: 0.87 },
            { type: 'bill', id: 3, name: 'PS2 Infrastructure Bill', description: 'Development charges', matchScore: 0.73 }
          );
        }
        
        if (searchTerm.includes('client') || searchTerm.includes('customer')) {
          dummyResults.push(
            { type: 'client', id: 1, name: 'Ramesh Kumar', description: 'PS2 Plot Owner', matchScore: 0.91 },
            { type: 'client', id: 2, name: 'Suresh Patel', description: 'Interested in PS2', matchScore: 0.85 }
          );
        }
        
        setResults(dummyResults.length > 0 ? dummyResults : [
          { type: 'expense', id: 1, name: 'Miscellaneous Expense', description: 'General search result', matchScore: 0.6 },
          { type: 'layout', id: 2, name: 'Latest Layout', description: 'Recently added layout', matchScore: 0.5 }
        ]);
      }
      
      setIsSearching(false);
    }, 1200);
  };

  const renderResults = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Searching through your data...</p>
          <p className="text-sm text-gray-500 mt-1">Analyzing query: "{query}"</p>
        </div>
      );
    }
    
    if (hasSearched) {
      if (resultType === 'table') {
        return (
          <div className="bg-white rounded-md shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Search Results</h3>
              <p className="text-sm text-gray-500">Found {results.length} results for "{query}"</p>
            </div>
            
            <div className="divide-y">
              {results.map((result) => (
                <div key={`${result.type}-${result.id}`} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-md mr-3">
                      {result.type === 'layout' && <LineChart className="h-5 w-5 text-blue-500" />}
                      {result.type === 'plot' && <Table className="h-5 w-5 text-green-500" />}
                      {result.type === 'expense' && <BarChart className="h-5 w-5 text-amber-500" />}
                      {result.type === 'client' && <Search className="h-5 w-5 text-purple-500" />}
                      {result.type === 'bill' && <FileType className="h-5 w-5 text-red-500" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{result.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{result.description}</p>
                      <div className="text-xs text-gray-500">
                        Match score: {Math.round(result.matchScore * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      } else if (resultType === 'chart') {
        return (
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Analysis Results</h3>
                <p className="text-sm text-gray-500">Generated chart for query: "{query}"</p>
              </div>
              
              <div className="h-80 bg-gray-50 rounded border flex items-center justify-center mb-4">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart visualization would appear here</p>
                  <p className="text-xs text-gray-400">Based on your query: "{query}"</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      } else if (resultType === 'report') {
        return (
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Generated Report</h3>
                <p className="text-sm text-gray-500">PDF report for query: "{query}"</p>
              </div>
              
              <div className="h-96 bg-gray-50 rounded border flex items-center justify-center mb-4">
                <div className="text-center">
                  <FileType className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">PDF report preview would appear here</p>
                  <p className="text-xs text-gray-400">Based on your query: "{query}"</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }
    }
    
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Try searching for something</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Use natural language to search across all your data, generate reports, and find insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
          {dummySearchExamples.map((example, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm"
              onClick={() => {
                setQuery(example);
              }}
              className="justify-start text-sm"
            >
              <Search className="h-3 w-3 mr-2" />
              {example}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Search Assistant</h1>
        <p className="text-gray-600">Search and analyze data using natural language</p>
      </div>
      
      <div className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Ask a question or search for something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
            Search
          </Button>
        </div>
        
        {currentUser?.role === 'black' || currentUser?.role === 'admin' ? (
          <div className="mt-3 text-sm text-gray-600">
            <p className="font-medium">Pro features available:</p>
            <ul className="list-disc list-inside ml-2 text-gray-500">
              <li>Complex analytics queries</li>
              <li>Report generation</li>
              <li>Profit/loss calculations</li>
            </ul>
          </div>
        ) : null}
      </div>
      
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">Search History</TabsTrigger>
          <TabsTrigger value="saved">Saved Searches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="p-0">
          {renderResults()}
        </TabsContent>
        
        <TabsContent value="history" className="p-0">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Your recent searches will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved" className="p-0">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">You have no saved searches</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AISearchPage;
