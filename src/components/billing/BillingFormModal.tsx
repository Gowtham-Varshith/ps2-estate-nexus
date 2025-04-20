
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { layouts } from "@/data/mockData";
import { CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface BillingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const BillingFormModal = ({ isOpen, onClose, onSubmit }: BillingFormModalProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    layoutId: "",
    plotNo: "",
    areaSqft: "",
    paymentType: "full",
    advanceAmount: "",
    notes: "",
    isBlack: false
  });
  
  const [selectedLayout, setSelectedLayout] = useState<any>(null);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "layoutId") {
      const layout = layouts.find(l => l.id === parseInt(value));
      setSelectedLayout(layout);
      setFormData(prev => ({ ...prev, plotNo: "" }));
      setSelectedPlot(null);
    }
    
    if (name === "paymentType" && value === "full") {
      setDueDate(undefined);
    }
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isBlack: checked }));
  };
  
  const handleSubmit = () => {
    const billData = {
      ...formData,
      date: format(date, "yyyy-MM-dd"),
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      layoutName: selectedLayout?.name || "",
      plotDetails: selectedPlot || {},
      govValue: selectedPlot && formData.areaSqft ? 
        parseInt(formData.areaSqft) * parseInt(selectedLayout?.govRatePerSqft || "0") : 0
    };
    
    onSubmit(billData);
    
    // Reset form
    setFormData({
      clientName: "",
      clientPhone: "",
      layoutId: "",
      plotNo: "",
      areaSqft: "",
      paymentType: "full",
      advanceAmount: "",
      notes: "",
      isBlack: false
    });
    setDate(new Date());
    setDueDate(undefined);
    setSelectedLayout(null);
    setSelectedPlot(null);
  };
  
  const handlePlotSelect = (plotNo: string) => {
    const mockPlot = {
      plotNumber: plotNo,
      areaSqft: "1200"
    };
    
    setSelectedPlot(mockPlot);
    setFormData(prev => ({ ...prev, plotNo, areaSqft: mockPlot.areaSqft }));
  };
  
  const govValue = selectedLayout && formData.areaSqft 
    ? parseInt(formData.areaSqft) * parseInt(selectedLayout.govRatePerSqft)
    : 0;
  
  const handleAiSuggest = () => {
    let suggestion = "";
    
    if (formData.paymentType === "advance") {
      suggestion = `Advance payment received for ${formData.plotNo} in ${selectedLayout?.name}. Balance due on ${dueDate ? format(dueDate, "dd/MM/yyyy") : "TBD"}.`;
    } else {
      suggestion = `Full payment received for ${formData.plotNo} in ${selectedLayout?.name}. Plot handover completed.`;
    }
    
    if (formData.isBlack) {
      suggestion += " Additional black amount received in cash.";
    }
    
    setFormData(prev => ({ ...prev, notes: suggestion }));
  };
  
  const isFormValid = () => {
    if (formData.paymentType === "advance") {
      return (
        formData.clientName && 
        formData.clientPhone && 
        formData.layoutId && 
        formData.plotNo && 
        formData.areaSqft && 
        formData.advanceAmount && 
        dueDate
      );
    }
    
    return (
      formData.clientName && 
      formData.clientPhone && 
      formData.layoutId && 
      formData.plotNo && 
      formData.areaSqft
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Bill</DialogTitle>
          <DialogDescription>
            Create a new bill for a client purchasing a plot
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="Enter client name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Phone Number</Label>
              <Input
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="layoutId">Select Layout</Label>
            <Select
              value={formData.layoutId}
              onValueChange={(value) => handleSelectChange("layoutId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a layout" />
              </SelectTrigger>
              <SelectContent>
                {layouts.map((layout) => (
                  <SelectItem key={layout.id} value={layout.id.toString()}>
                    {layout.name} ({layout.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plotNo">Plot Number</Label>
              <Select
                value={formData.plotNo}
                onValueChange={(value) => handlePlotSelect(value)}
                disabled={!selectedLayout}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedLayout ? "Select a plot" : "Select a layout first"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedLayout && Array.from({ length: 5 }, (_, i) => (
                    <SelectItem 
                      key={i} 
                      value={`${selectedLayout.name.substring(0, 2).toUpperCase()}${(i + 1).toString().padStart(3, '0')}`}
                    >
                      {`${selectedLayout.name.substring(0, 2).toUpperCase()}${(i + 1).toString().padStart(3, '0')}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="areaSqft">Area (sq.ft)</Label>
              <Input
                id="areaSqft"
                name="areaSqft"
                type="number"
                value={formData.areaSqft}
                onChange={handleInputChange}
                placeholder="Enter area"
                disabled={!selectedPlot}
              />
            </div>
          </div>
          
          {selectedLayout && formData.areaSqft && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Plot Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Gov Rate:</span>
                  <span className="ml-1 font-medium">₹{parseInt(selectedLayout.govRatePerSqft).toLocaleString()}/sq.ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Plot Area:</span>
                  <span className="ml-1 font-medium">{parseInt(formData.areaSqft).toLocaleString()} sq.ft</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Gov Value:</span>
                  <span className="ml-1 font-medium">
                    ₹{govValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="date">Bill Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value) => handleSelectChange("paymentType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Payment</SelectItem>
                <SelectItem value="advance">Advance Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.paymentType === "advance" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advanceAmount">Advance Amount</Label>
                <Input
                  id="advanceAmount"
                  name="advanceAmount"
                  type="number"
                  value={formData.advanceAmount}
                  onChange={handleInputChange}
                  placeholder="Enter advance amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="notes">Notes</Label>
              <Button variant="ghost" size="sm" onClick={handleAiSuggest} className="h-7">
                <Sparkles size={14} className="mr-1" />
                AI Suggest
              </Button>
            </div>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add notes about this transaction"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isBlack" 
              checked={formData.isBlack} 
              onCheckedChange={handleCheckboxChange} 
            />
            <label
              htmlFor="isBlack"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as Black (uses PS2)
            </label>
          </div>
          
          {formData.isBlack && (
            <div className="text-sm p-2 border border-amber-200 bg-amber-50 rounded-md">
              <p>This transaction will be recorded with dual ledger entries:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>White (Gov) entry for official records</li>
                <li>Black (PS2) entry for private records</li>
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Generate Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillingFormModal;
