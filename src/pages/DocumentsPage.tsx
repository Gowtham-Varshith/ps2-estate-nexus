
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, FilterX, FileText, FileImage, FileSpreadsheet, File } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDocuments, getLayouts } from "@/data/mockData";

const DocumentsPage = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState(getDocuments());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const layouts = getLayouts();
  
  useEffect(() => {
    document.title = "Documents | PS2 Estate Nexus";
  }, []);
  
  const filteredDocuments = documents.filter(doc => {
    // Filter by search query
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // Filter by category
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group documents by layout
  const documentsByLayout = filteredDocuments.reduce((acc: any, doc: any) => {
    if (doc.layoutId) {
      if (!acc[doc.layoutId]) {
        acc[doc.layoutId] = [];
      }
      acc[doc.layoutId].push(doc);
    }
    return acc;
  }, {});
  
  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="text-red-500" />;
      case 'image':
      case 'jpg':
      case 'png':
        return <FileImage className="text-blue-500" />;
      case 'excel':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="text-green-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600">Store and manage all your property documents</p>
      </div>
      
      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="layout">Layout Documents</SelectItem>
                <SelectItem value="client">Client Documents</SelectItem>
                <SelectItem value="billing">Billing Documents</SelectItem>
                <SelectItem value="legal">Legal Documents</SelectItem>
                <SelectItem value="other">Other Documents</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              <FilterX size={18} />
            </Button>
          </div>
          
          <Button className="bg-ps2-primary hover:bg-ps2-secondary">
            <Upload size={18} className="mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="layouts">By Layout</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">All Documents</h2>
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {doc.size} • Uploaded: {doc.uploadDate}
                      </p>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap mt-1 gap-1">
                          {doc.tags.map((tag: string, tagIdx: number) => (
                            <span key={tagIdx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No documents found matching your search
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="layouts" className="space-y-6">
          {Object.keys(documentsByLayout).length > 0 ? (
            layouts
              .filter(layout => documentsByLayout[layout.id])
              .map(layout => (
                <div key={layout.id} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">{layout.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentsByLayout[layout.id].map((doc: any, index: number) => (
                      <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {doc.size} • Uploaded: {doc.uploadDate}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center py-10 text-gray-500">
              No documents found for any layouts
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          {['layout', 'client', 'billing', 'legal', 'other'].map(category => {
            const docsInCategory = filteredDocuments.filter(doc => doc.category === category);
            
            if (docsInCategory.length === 0) return null;
            
            return (
              <div key={category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 capitalize">{category} Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docsInCategory.map((doc, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {doc.size} • Uploaded: {doc.uploadDate}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default DocumentsPage;
