
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMetric } from "@/contexts/MetricContext";
import { convertArea, formatArea } from "@/utils/metricConversions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Plus, Minus, Calculator, Check } from "lucide-react";

const CreateLayoutPage = () => {
  const { currentUser } = useAuth();
  const { currentMetric } = useMetric();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    totalArea: "",
    govRatePerSqft: "",
    marketRatePerSqft: "",
    description: "",
    plotCount: 0
  });
  
  const [confirmChange, setConfirmChange] = useState(false);
  const [marketConfirmed, setMarketConfirmed] = useState(false);
  const [plots, setPlots] = useState<{ plotNumber: string; areaSqft: string }[]>([]);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  
  // Calculated fields
  const totalMarketValue = formData.totalArea && formData.marketRatePerSqft ? 
    parseFloat(formData.totalArea) * parseFloat(formData.marketRatePerSqft) * 
    convertArea(1, currentMetric, 'sqft') : 0;
    
  const totalGovValue = formData.totalArea && formData.govRatePerSqft ? 
    parseFloat(formData.totalArea) * parseFloat(formData.govRatePerSqft) * 
    convertArea(1, currentMetric, 'sqft') : 0;
    
  const potentialProfit = totalMarketValue - totalGovValue;
  
  useEffect(() => {
    document.title = "Create Layout | PS2 Estate Nexus";
    
    // Update permissions to include staff
    if (currentUser && !["staff", "black", "admin"].includes(currentUser.role)) {
      navigate("/layouts");
      toast({
        title: "Access Denied",
        description: "You don't have permission to create new layouts",
        variant: "destructive"
      });
    }
  }, [currentUser, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If changing market rate, require confirmation
    if (name === 'marketRatePerSqft' && value !== formData.marketRatePerSqft) {
      setConfirmChange(true);
      setMarketConfirmed(false);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const confirmMarketRate = () => {
    setConfirmChange(false);
    setMarketConfirmed(true);
    
    toast({
      title: "Market Rate Confirmed",
      description: `Market rate set to ₹${parseFloat(formData.marketRatePerSqft).toLocaleString('en-IN')}/sqft`,
    });
  };
  
  const handleAddPlot = () => {
    const newPlot = {
      plotNumber: `${formData.name.substring(0, 2).toUpperCase()}${(plots.length + 1).toString().padStart(3, '0')}`,
      areaSqft: ""
    };
    setPlots([...plots, newPlot]);
    setFormData(prev => ({ ...prev, plotCount: prev.plotCount + 1 }));
  };
  
  const handleRemovePlot = (index: number) => {
    const updatedPlots = [...plots];
    updatedPlots.splice(index, 1);
    setPlots(updatedPlots);
    setFormData(prev => ({ ...prev, plotCount: prev.plotCount - 1 }));
  };
  
  const handlePlotChange = (index: number, field: string, value: string) => {
    const updatedPlots = [...plots];
    updatedPlots[index] = { ...updatedPlots[index], [field]: value };
    setPlots(updatedPlots);
  };
  
  const handleBlueprintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBlueprintFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.location || !formData.totalArea || !formData.govRatePerSqft) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Market rate is required and must be confirmed
    if (!formData.marketRatePerSqft || !marketConfirmed) {
      toast({
        title: "Market Rate Not Confirmed",
        description: "Please enter and confirm the market rate",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate creating layout
    toast({
      title: "Layout Created",
      description: `Successfully created ${formData.name} layout`,
    });
    
    // Redirect to layouts page
    navigate("/layouts");
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Layout</h1>
        <p className="text-gray-600">Add a new property layout to the system</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Layout Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Layout Details</CardTitle>
              <CardDescription>Enter the basic information about the layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Layout Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter layout name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalArea">Total Area (in {currentMetric})</Label>
                  <Input
                    id="totalArea"
                    name="totalArea"
                    type="number"
                    value={formData.totalArea}
                    onChange={handleInputChange}
                    placeholder={`Enter total area in ${currentMetric}`}
                    required
                  />
                  {formData.totalArea && (
                    <div className="text-xs text-gray-500 mt-1">
                      {parseFloat(formData.totalArea) > 0 && currentMetric !== 'sqft' && (
                        <p>
                          ≈ {formatArea(
                            parseFloat(formData.totalArea) * convertArea(1, currentMetric, 'sqft'),
                            'sqft'
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="govRatePerSqft">Government Rate (per sq.ft)</Label>
                  <Input
                    id="govRatePerSqft"
                    name="govRatePerSqft"
                    type="number"
                    value={formData.govRatePerSqft}
                    onChange={handleInputChange}
                    placeholder="Enter government rate"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marketRatePerSqft" className="flex items-center">
                  Market Rate (per sq.ft)
                  {marketConfirmed && <Check className="ml-2 h-4 w-4 text-green-500" />}
                </Label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <Input
                      id="marketRatePerSqft"
                      name="marketRatePerSqft"
                      type="number"
                      value={formData.marketRatePerSqft}
                      onChange={handleInputChange}
                      placeholder="Enter market rate"
                      required
                      className={confirmChange ? "border-orange-300 ring-1 ring-orange-200" : ""}
                    />
                  </div>
                  {confirmChange && (
                    <Button 
                      type="button" 
                      onClick={confirmMarketRate}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      Confirm Rate
                    </Button>
                  )}
                </div>
                {currentUser?.role === 'black' || currentUser?.role === 'admin' ? (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Profit Analysis</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-xs text-gray-500">Total Gov Value</p>
                        <p className="text-sm font-medium">₹{totalGovValue.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Market Value</p>
                        <p className="text-sm font-medium">₹{totalMarketValue.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Potential Profit</p>
                        <p className="text-sm font-medium text-green-600">₹{potentialProfit.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter layout description"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Blueprint Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {blueprintFile ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={URL.createObjectURL(blueprintFile)} 
                        alt="Blueprint preview" 
                        className="max-h-40 object-contain mb-2"
                      />
                      <p className="text-sm text-gray-500 mb-2">{blueprintFile.name}</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBlueprintFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop your blueprint image, or click to browse
                      </p>
                      <Input
                        id="blueprint"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBlueprintChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('blueprint')?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Plot List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Plots</CardTitle>
              <CardDescription>Add plots to this layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                type="button"
                className="w-full"
                onClick={handleAddPlot}
              >
                <Plus size={18} className="mr-2" />
                Add Plot
              </Button>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {plots.map((plot, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Plot #{index + 1}</span>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleRemovePlot(index)}
                      >
                        <Minus size={16} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`plot-${index}-number`} className="text-sm">Plot Number</Label>
                        <Input
                          id={`plot-${index}-number`}
                          value={plot.plotNumber}
                          onChange={(e) => handlePlotChange(index, 'plotNumber', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`plot-${index}-area`} className="text-sm">Area (sq.ft)</Label>
                        <Input
                          id={`plot-${index}-area`}
                          type="number"
                          value={plot.areaSqft}
                          onChange={(e) => handlePlotChange(index, 'areaSqft', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {plots.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No plots added yet. Click "Add Plot" to start adding plots.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Form Actions */}
          <div className="lg:col-span-3 flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/layouts")}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-ps2-primary hover:bg-ps2-secondary">
              Create Layout
            </Button>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default CreateLayoutPage;
