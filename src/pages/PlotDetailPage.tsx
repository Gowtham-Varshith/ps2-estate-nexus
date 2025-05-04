
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  FileImage, 
  FileVideo, 
  Clock, 
  Check, 
  MapPin,
  User,
  Phone,
  CalendarDays,
  IndianRupee,
  Send,
  Share2,
  Info,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PlotDocument {
  id: number;
  name: string;
  size: string;
  type: "image" | "video" | "document";
  url: string;
  uploadDate: string;
}

const PlotDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [showGenerateBrochureDialog, setShowGenerateBrochureDialog] = useState(false);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [customMessage, setCustomMessage] = useState("");
  const [plotDocuments, setPlotDocuments] = useState<PlotDocument[]>([]);
  
  // Mock plot data
  const plotData = {
    id: parseInt(id || "1"),
    plotNumber: "PS2-A12",
    area: 1200,
    areaUnit: "sqft",
    price: 4800000,
    status: "available",
    layout: {
      id: 1,
      name: "PS2 Paradise",
      location: "Outer Ring Road",
    },
    dimensions: "40ft x 30ft",
    facing: "East",
    isPrime: true,
    description: "Premium corner plot with excellent connectivity and amenities nearby.",
    images: [],
    createdAt: "2023-04-10T12:00:00Z"
  };
  
  // Sample predefined messages
  const predefinedMessages = {
    english: "Thank you for your interest in Plot {{plotNumber}} in our {{layoutName}} project. This premium {{area}} {{areaUnit}} plot is perfect for your needs. Would you like to schedule a site visit?",
    telugu: "మీరు మా {{layoutName}} ప్రాజెక్ట్‌లోని {{plotNumber}} ప్లాట్‌లో ఆసక్తి చూపినందుకు ధన్యవాదాలు. ఈ ప్రీమియం {{area}} {{areaUnit}} ప్లాట్ మీ అవసరాలకు సరిపోతుంది. మీరు సైట్ సందర్శనను షెడ్యూల్ చేయాలనుకుంటున్నారా?",
    hindi: "हमारे {{layoutName}} प्रोजेक्ट में प्लॉट {{plotNumber}} में आपकी रुचि के लिए धन्यवाद। यह प्रीमियम {{area}} {{areaUnit}} प्लॉट आपकी जरूरतों के लिए एकदम सही है। क्या आप साइट विजिट शेड्यूल करना चाहेंगे?",
    kannada: "ನಮ್ಮ {{layoutName}} ಯೋಜನೆಯಲ್ಲಿನ ಪ್ಲಾಟ್ {{plotNumber}} ರಲ್ಲಿ ನಿಮ್ಮ ಆಸಕ್ತಿಗೆ ಧನ್ಯವಾದಗಳು. ಈ ಪ್ರೀಮಿಯಂ {{area}} {{areaUnit}} ಪ್ಲಾಟ್ ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಸರಿಯಾಗಿದೆ. ನೀವು ಸೈಟ್ ಭೇಟಿಯನ್ನು ನಿಗದಿಪಡಿಸಲು ಬಯಸುತ್ತೀರಾ?"
  };
  
  useEffect(() => {
    document.title = `Plot ${id} | PS2 Estate Nexus`;
    
    // Simulating API call to fetch plot documents
    setTimeout(() => {
      const dummyDocuments: PlotDocument[] = [
        {
          id: 1,
          name: "Plot View Front.jpg",
          size: "2.4 MB",
          type: "image",
          url: "/placeholder.svg",
          uploadDate: "2023-04-12"
        },
        {
          id: 2,
          name: "Site Video Tour.mp4",
          size: "14.8 MB",
          type: "video",
          url: "/placeholder.svg",
          uploadDate: "2023-04-15"
        },
        {
          id: 3,
          name: "Plot Measurements.pdf",
          size: "1.2 MB",
          type: "document",
          url: "/placeholder.svg",
          uploadDate: "2023-04-11"
        }
      ];
      
      setPlotDocuments(dummyDocuments);
    }, 1000);
  }, [id]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        const file = e.target.files![0];
        let fileType: "image" | "video" | "document" = "document";
        
        if (file.type.includes('image')) {
          fileType = "image";
        } else if (file.type.includes('video')) {
          fileType = "video";
        }
        
        const newDocument: PlotDocument = {
          id: plotDocuments.length + 1,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: fileType,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toISOString().split('T')[0]
        };
        
        setPlotDocuments([...plotDocuments, newDocument]);
        setIsUploading(false);
        
        toast({
          title: "File Uploaded",
          description: `${file.name} has been successfully uploaded.`
        });
      }, 1500);
    }
  };
  
  const handleGenerateBrochure = () => {
    setShowGenerateBrochureDialog(true);
  };
  
  const handleGenerateBrochureConfirm = () => {
    setShowGenerateBrochureDialog(false);
    
    // Simulate brochure generation
    toast({
      title: "Brochure Generated",
      description: "AI brochure has been generated successfully.",
    });
    
    // Add brochure to documents
    const newBrochure: PlotDocument = {
      id: plotDocuments.length + 1,
      name: `${plotData.plotNumber}_AI_Brochure.pdf`,
      size: "2.1 MB",
      type: "document",
      url: "/placeholder.svg",
      uploadDate: new Date().toISOString().split('T')[0]
    };
    
    setPlotDocuments([...plotDocuments, newBrochure]);
  };
  
  const handleWhatsappSend = () => {
    setShowWhatsappDialog(true);
  };
  
  const handleWhatsappSendConfirm = () => {
    setShowWhatsappDialog(false);
    
    // Replace placeholders in the message template
    const messageWithValues = (customMessage || predefinedMessages[selectedLanguage as keyof typeof predefinedMessages])
      .replace("{{plotNumber}}", plotData.plotNumber)
      .replace("{{layoutName}}", plotData.layout.name)
      .replace("{{area}}", plotData.area.toString())
      .replace("{{areaUnit}}", plotData.areaUnit);
    
    // Simulate sending WhatsApp message
    toast({
      title: "WhatsApp Message Sent",
      description: `Message sent in ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}`,
    });
    
    console.log("Message sent:", messageWithValues);
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage size={20} className="text-blue-500" />;
      case "video":
        return <FileVideo size={20} className="text-purple-500" />;
      default:
        return <FileText size={20} className="text-amber-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "reserved":
        return <Badge className="bg-amber-100 text-amber-800">Reserved</Badge>;
      case "sold":
        return <Badge className="bg-blue-100 text-blue-800">Sold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{plotData.plotNumber}</h1>
            {getStatusBadge(plotData.status)}
            {plotData.isPrime && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                Premium Plot
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <MapPin size={16} />
            <span>{plotData.layout.name}, {plotData.layout.location}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handleGenerateBrochure}
          >
            <Sparkles size={18} />
            Generate AI Brochure
          </Button>
          
          <Button 
            className="gap-2"
            onClick={handleWhatsappSend}
          >
            <Send size={18} />
            Send WhatsApp Message
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Plot Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Area</span>
                      <span className="font-medium text-gray-900">{plotData.area} {plotData.areaUnit}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions</span>
                      <span className="font-medium text-gray-900">{plotData.dimensions}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Facing</span>
                      <span className="font-medium text-gray-900">{plotData.facing}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium text-gray-900">₹{plotData.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Timeline</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium text-gray-900">
                        {new Date(plotData.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Documents</span>
                      <span className="font-medium text-gray-900">{plotDocuments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{plotData.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Documents & Media</span>
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                      <Upload size={16} />
                      <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    </div>
                  </label>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Files</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="p-0">
                  {plotDocuments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-gray-500">No documents uploaded yet</h3>
                      <p className="text-sm text-gray-400 mt-1">Upload images, videos or documents</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {plotDocuments.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md shadow-sm">
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.size} • Uploaded {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="images" className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {plotDocuments
                      .filter(doc => doc.type === "image")
                      .map(doc => (
                        <div key={doc.id} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    
                    {plotDocuments.filter(doc => doc.type === "image").length === 0 && (
                      <div className="col-span-3 text-center py-8">
                        <p className="text-gray-500">No images uploaded yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="videos" className="p-0">
                  <div className="space-y-3">
                    {plotDocuments
                      .filter(doc => doc.type === "video")
                      .map(doc => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md shadow-sm">
                              <FileVideo size={20} className="text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.size} • Uploaded {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    
                    {plotDocuments.filter(doc => doc.type === "video").length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No videos uploaded yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="p-0">
                  <div className="space-y-3">
                    {plotDocuments
                      .filter(doc => doc.type === "document")
                      .map(doc => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md shadow-sm">
                              <FileText size={20} className="text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.size} • Uploaded {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    
                    {plotDocuments.filter(doc => doc.type === "document").length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No documents uploaded yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Layout Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{plotData.layout.name}</h3>
                <p className="text-gray-600">{plotData.layout.location}</p>
              </div>
              
              <Button variant="outline" className="w-full">
                View Layout Details
              </Button>
            </CardContent>
          </Card>
          
          {(currentUser?.role === 'black' || currentUser?.role === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Share2 size={18} />
                  Share Plot Details
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-2">
                  <IndianRupee size={18} />
                  Update Pricing
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Info size={18} />
                  Market Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Generate Brochure Dialog */}
      <Dialog open={showGenerateBrochureDialog} onOpenChange={setShowGenerateBrochureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate AI Brochure</DialogTitle>
            <DialogDescription>
              Create a professional brochure for this plot using AI.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Brochure Style</Label>
              <Select defaultValue="premium">
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Include Features</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="include-map" defaultChecked className="rounded" />
                  <Label htmlFor="include-map" className="font-normal">Map</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="include-photos" defaultChecked className="rounded" />
                  <Label htmlFor="include-photos" className="font-normal">Photos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="include-amenities" defaultChecked className="rounded" />
                  <Label htmlFor="include-amenities" className="font-normal">Amenities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="include-pricing" defaultChecked className="rounded" />
                  <Label htmlFor="include-pricing" className="font-normal">Pricing</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateBrochureDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateBrochureConfirm}>
              Generate Brochure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* WhatsApp Message Dialog */}
      <Dialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Customize your message or use a predefined template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message Language</Label>
              <Select 
                value={selectedLanguage} 
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="telugu">Telugu</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="kannada">Kannada</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Auto-detects language based on client's region
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Select defaultValue="new">
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Client</SelectItem>
                  <SelectItem value="1">Ramesh Kumar</SelectItem>
                  <SelectItem value="2">Suresh Patel</SelectItem>
                  <SelectItem value="3">Aditya Sharma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Message</Label>
                <span className="text-xs text-gray-500">Placeholders will be filled automatically</span>
              </div>
              <Textarea 
                placeholder="Enter your custom message or use the template"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Template available: {{`{{plotNumber}}, {{layoutName}}, {{area}}, {{areaUnit}}`}}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Add Attachments</Label>
              <Select defaultValue="brochure">
                <SelectTrigger>
                  <SelectValue placeholder="Select attachment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brochure">Plot Brochure</SelectItem>
                  <SelectItem value="layout">Layout Plan</SelectItem>
                  <SelectItem value="photos">Plot Photos</SelectItem>
                  <SelectItem value="none">No Attachment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsappDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWhatsappSendConfirm}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlotDetailPage;
