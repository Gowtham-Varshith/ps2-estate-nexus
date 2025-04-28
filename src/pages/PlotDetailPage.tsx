
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  User, 
  Calendar, 
  FileText,
  Upload,
  Send,
  FileImage,
  FileVideo,
  File,
  Download,
  Languages
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const PlotDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [plot, setPlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [languageOptions] = useState<string[]>(["English", "Telugu", "Hindi", "Kannada"]);
  const [selectedLanguage, setSelectedLanguage] = useState("Telugu"); // Auto-detected based on client location
  
  useEffect(() => {
    // Simulate API call to /api/plots/{id}
    setTimeout(() => {
      // Dummy data
      setPlot({
        id,
        number: "GV001",
        layout: "PS2",
        area: 1200,
        govPrice: 2000,
        marketPrice: 4000,
        status: "Available",
        client: null,
        documents: [],
        location: {
          lat: 16.4721,
          lng: 80.6782,
          address: "Near Highway, Guntur District"
        },
        history: [
          { date: "2025-01-15", event: "Plot Created", user: "Admin" },
          { date: "2025-02-10", event: "Site Visit", user: "Ramesh Kumar" },
          { date: "2025-03-05", event: "Price Updated", user: "Admin" }
        ]
      });
      
      setLoading(false);
      document.title = `Plot GV001 | PS2 Estate Nexus`;
    }, 800);
  }, [id]);
  
  const handleUpload = (type: string) => {
    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      
      // Add document to plot
      const newDoc = {
        id: Date.now(),
        name: `${type}_${plot?.number}_${new Date().toISOString().split('T')[0]}.${type === 'document' ? 'pdf' : type}`,
        type: type,
        url: "#",
        uploadDate: new Date().toISOString()
      };
      
      setPlot(prev => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc]
      }));
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
    }, 1500);
  };
  
  const handleGenerateBrochure = () => {
    // Simulate API call to /api/brochure/generate
    toast.success("AI Brochure generated successfully");
    
    // Add document to plot
    const newDoc = {
      id: Date.now(),
      name: `Brochure_${plot?.number}_${new Date().toISOString().split('T')[0]}.pdf`,
      type: "document",
      url: "#",
      uploadDate: new Date().toISOString()
    };
    
    setPlot(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc]
    }));
  };
  
  const handleSendWhatsApp = () => {
    setWhatsappDialogOpen(true);
  };
  
  const sendWhatsAppMessage = () => {
    // Simulate API call to /api/whatsapp/send
    toast.success(`WhatsApp message sent successfully in ${selectedLanguage}`);
    setWhatsappDialogOpen(false);
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage size={40} className="text-blue-500" />;
      case 'video':
        return <FileVideo size={40} className="text-red-500" />;
      case 'document':
      default:
        return <File size={40} className="text-amber-500" />;
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Plot {plot.number}</h1>
            <Badge variant={plot.status === "Available" ? "outline" : "default"} className="text-sm">
              {plot.status}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">{plot.layout} Layout - {plot.area} sq.ft</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateBrochure} className="gap-2">
            <Download size={16} />
            Generate Brochure
          </Button>
          <Button onClick={handleSendWhatsApp} className="gap-2">
            <Send size={16} />
            WhatsApp Message
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="aspect-video bg-gray-100 rounded-md mb-6 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Plot location map view</p>
                <p className="text-sm text-gray-400 mt-1">{plot.location.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Area</h3>
                <p className="text-lg font-semibold">{plot.area} sq.ft</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
                <p className="text-lg font-semibold">₹{plot.govPrice}/sq.ft</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Value</h3>
                <p className="text-lg font-semibold">₹{(plot.area * plot.govPrice).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Plot Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-blue-500" size={20} />
                <div>
                  <p className="text-sm font-medium">Owner</p>
                  <p className="text-sm text-gray-600">{plot.client ? plot.client.name : "Available"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="text-blue-500" size={20} />
                <div>
                  <p className="text-sm font-medium">Created On</p>
                  <p className="text-sm text-gray-600">{plot.history[0].date}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FileText className="text-blue-500" size={20} />
                <div>
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-sm text-gray-600">{plot.documents.length} files</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h3 className="font-medium mb-4">Upload Files</h3>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  disabled={isUploading}
                  onClick={() => handleUpload('image')}
                >
                  <FileImage size={16} className="mr-2" />
                  Upload Images
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  disabled={isUploading}
                  onClick={() => handleUpload('video')}
                >
                  <FileVideo size={16} className="mr-2" />
                  Upload Video
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  disabled={isUploading}
                  onClick={() => handleUpload('document')}
                >
                  <File size={16} className="mr-2" />
                  Upload Documents
                </Button>
              </div>
              
              {isUploading && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Uploading...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              {plot.documents.length === 0 ? (
                <div className="text-center py-12">
                  <Upload size={48} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No documents yet</h3>
                  <p className="text-gray-500 mt-1 mb-4">Upload images, videos or documents related to this plot</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => handleUpload('document')}>Upload Document</Button>
                    <Button onClick={handleGenerateBrochure}>Generate Brochure</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {plot.documents.map((doc: any) => (
                    <div key={doc.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-3">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-3 flex gap-2 justify-center">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Send size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {plot.history.map((event: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-gray-500">By {event.user} on {new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* WhatsApp Dialog */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send information about Plot {plot.number} in {plot.layout} layout
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Message Language</label>
                <div className="flex items-center text-xs text-gray-500">
                  <Languages size={14} className="mr-1" />
                  Auto-detected based on client location
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map(lang => (
                  <Badge 
                    key={lang} 
                    variant={selectedLanguage === lang ? "default" : "outline"}
                    className={`cursor-pointer ${selectedLanguage === lang ? 'bg-blue-500' : ''}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Textarea 
              className="min-h-[120px]"
              defaultValue={`Thank you for your interest in Plot ${plot.number} in ${plot.layout} layout. The plot is ${plot.area} sq.ft and priced at ₹${plot.govPrice}/sq.ft. Would you like to schedule a visit or get more details?`}
            />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Attach Files</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer flex items-center gap-1">
                  <Download size={12} />
                  Brochure
                </Badge>
                <Badge variant="outline" className="cursor-pointer flex items-center gap-1">
                  <Download size={12} />
                  Plot Details
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setWhatsappDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendWhatsAppMessage} className="bg-green-600 hover:bg-green-700">
                <Send size={16} className="mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlotDetailPage;
