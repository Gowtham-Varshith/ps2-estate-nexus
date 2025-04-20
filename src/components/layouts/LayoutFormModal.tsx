
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, Upload } from "lucide-react";

interface LayoutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const LayoutFormModal = ({ isOpen, onClose, onSubmit }: LayoutFormModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    totalArea: "",
    govRatePerSqft: "",
    description: "",
    plotCount: 4
  });
  
  const [step, setStep] = useState(1);
  const [plots, setPlots] = useState<{ plotNumber: string; areaSqft: string }[]>([]);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePlotCountChange = (increase: boolean) => {
    setFormData(prev => ({
      ...prev,
      plotCount: increase 
        ? Math.min(prev.plotCount + 1, 50) 
        : Math.max(prev.plotCount - 1, 1)
    }));
  };
  
  const handleBlueprintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBlueprintFile(e.target.files[0]);
    }
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      // Generate plots based on plotCount
      const generatedPlots = Array.from({ length: formData.plotCount }, (_, index) => ({
        plotNumber: `${formData.name.substring(0, 2).toUpperCase()}${(index + 1).toString().padStart(3, '0')}`,
        areaSqft: Math.round(parseFloat(formData.totalArea) * 43560 / formData.plotCount).toString()
      }));
      
      setPlots(generatedPlots);
      setStep(2);
    } else {
      // Submit the form
      onSubmit({
        ...formData,
        plots,
        blueprint: blueprintFile
      });
      
      // Reset form
      setFormData({
        name: "",
        location: "",
        totalArea: "",
        govRatePerSqft: "",
        description: "",
        plotCount: 4
      });
      setBlueprintFile(null);
      setPlots([]);
      setStep(1);
    }
  };
  
  const handleClose = () => {
    // Reset form on close
    setFormData({
      name: "",
      location: "",
      totalArea: "",
      govRatePerSqft: "",
      description: "",
      plotCount: 4
    });
    setBlueprintFile(null);
    setPlots([]);
    setStep(1);
    onClose();
  };
  
  const handlePlotChange = (index: number, field: string, value: string) => {
    const updatedPlots = [...plots];
    updatedPlots[index] = { ...updatedPlots[index], [field]: value };
    setPlots(updatedPlots);
  };
  
  const isFirstStepValid = formData.name && formData.location && formData.totalArea && formData.govRatePerSqft;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create New Layout" : "Configure Plot Details"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Enter the basic information about the new layout" 
              : "Review and customize the auto-generated plots for this layout"}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="grid gap-6 py-4">
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
                <Label htmlFor="totalArea">Total Area (in acres)</Label>
                <Input
                  id="totalArea"
                  name="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={handleInputChange}
                  placeholder="Enter total area"
                  required
                />
                {formData.totalArea && (
                  <p className="text-xs text-gray-500">
                    Approx. {Math.round(parseFloat(formData.totalArea) * 43560).toLocaleString()} sq.ft
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="govRatePerSqft">Gov Rate (per sq.ft)</Label>
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
              <Label>Number of Plots</Label>
              <div className="flex items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handlePlotCountChange(false)}
                  disabled={formData.plotCount <= 1}
                >
                  <Minus size={16} />
                </Button>
                <span className="mx-4 text-lg font-medium w-8 text-center">{formData.plotCount}</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handlePlotCountChange(true)}
                  disabled={formData.plotCount >= 50}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter layout description"
                rows={3}
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
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Layout Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{formData.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Area</p>
                  <p className="font-medium">{formData.totalArea} acres</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gov Rate</p>
                  <p className="font-medium">₹{parseInt(formData.govRatePerSqft).toLocaleString()}/sqft</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-700 mb-3">Configure Plots</h3>
            <p className="text-sm text-gray-500 mb-4">
              We've auto-generated {plots.length} plots for this layout. You can customize the plot numbers and areas below.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
              {plots.map((plot, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Plot #{index + 1}</span>
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
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {step === 2 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              Back to Layout Details
            </Button>
          )}
          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={step === 1 && !isFirstStepValid}
              onClick={handleNextStep}
            >
              {step === 1 ? "Next: Configure Plots" : "Create Layout"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LayoutFormModal;
