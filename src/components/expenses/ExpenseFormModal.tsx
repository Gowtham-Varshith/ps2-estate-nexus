
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
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const ExpenseFormModal = ({ isOpen, onClose, onSubmit }: ExpenseFormModalProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    layoutId: "",
    plotNo: "",
    type: "debit",
    visibility: "white",
    amount: "",
    reason: "",
    govPrice: "",
    marketPrice: "",
    isBlack: false
  });
  
  const [selectedLayout, setSelectedLayout] = useState<any>(null);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [plotSearchOpen, setPlotSearchOpen] = useState(false);
  const [plotSearchQuery, setPlotSearchQuery] = useState("");
  const [availablePlots, setAvailablePlots] = useState<Array<{id: string, name: string}>>([]);
  
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
      
      // Generate some mock plots for search
      if (layout) {
        const mockPlots = Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          name: `${layout.name.substring(0, 2).toUpperCase()}${(i + 1).toString().padStart(3, '0')}`
        }));
        setAvailablePlots(mockPlots);
      }
    }
    
    if (name === "visibility") {
      setFormData(prev => ({ 
        ...prev, 
        isBlack: value === "black"
      }));
    }
  };
  
  const handleSubmit = () => {
    const expenseData = {
      ...formData,
      date: format(date, "yyyy-MM-dd"),
      layoutName: selectedLayout?.name || "",
      plotDetails: selectedPlot || {},
      govValue: selectedPlot ? 
        parseInt(selectedPlot.areaSqft) * parseInt(selectedLayout?.govRatePerSqft || "0") : 0
    };
    
    onSubmit(expenseData);
    
    // Reset form
    setFormData({
      layoutId: "",
      plotNo: "",
      type: "debit",
      visibility: "white",
      amount: "",
      reason: "",
      govPrice: "",
      marketPrice: "",
      isBlack: false
    });
    setDate(new Date());
    setSelectedLayout(null);
    setSelectedPlot(null);
  };
  
  const handlePlotSelect = (plotId: string, plotName: string) => {
    const mockPlot = {
      plotNumber: plotName,
      areaSqft: "1200"
    };
    
    setSelectedPlot(mockPlot);
    setFormData(prev => ({ ...prev, plotNo: plotName }));
    setPlotSearchOpen(false);
  };
  
  const filteredPlots = availablePlots.filter(plot => 
    plot.name.toLowerCase().includes(plotSearchQuery.toLowerCase())
  );
  
  const isFormValid = () => {
    return (
      formData.layoutId && 
      formData.plotNo && 
      formData.type && 
      formData.visibility && 
      formData.amount && 
      formData.reason
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense or income for a specific plot
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="plotNo">Plot Number</Label>
            <div className="flex items-center gap-2">
              <Popover open={plotSearchOpen} onOpenChange={setPlotSearchOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    role="combobox"
                    disabled={!selectedLayout}
                    className="w-full justify-between"
                  >
                    {formData.plotNo ? formData.plotNo : selectedLayout ? "Search plots..." : "Select a layout first"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search plot number..."
                      value={plotSearchQuery}
                      onValueChange={setPlotSearchQuery}
                    />
                    <CommandEmpty>No plots found</CommandEmpty>
                    <CommandGroup>
                      {filteredPlots.map((plot) => (
                        <CommandItem
                          key={plot.id}
                          onSelect={() => handlePlotSelect(plot.id, plot.name)}
                        >
                          {plot.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {selectedLayout && selectedPlot && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Plot Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Area:</span>
                  <span className="ml-1 font-medium">{selectedPlot.areaSqft} sq.ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Gov Rate:</span>
                  <span className="ml-1 font-medium">₹{parseInt(selectedLayout.govRatePerSqft).toLocaleString()}/sq.ft</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Gov Value:</span>
                  <span className="ml-1 font-medium">
                    ₹{(parseInt(selectedPlot.areaSqft) * parseInt(selectedLayout.govRatePerSqft)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Income)</SelectItem>
                  <SelectItem value="debit">Debit (Expense)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => handleSelectChange("visibility", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White (Gov/Official)</SelectItem>
                  <SelectItem value="black">Black (Private)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="govPrice">Gov Price (₹)</Label>
            <Input
              id="govPrice"
              name="govPrice"
              type="number"
              value={formData.govPrice}
              onChange={handleInputChange}
              placeholder="Enter gov price"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="marketPrice">Market Price (₹)</Label>
            <Input
              id="marketPrice"
              name="marketPrice"
              type="number"
              value={formData.marketPrice}
              onChange={handleInputChange}
              placeholder="Enter market price"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
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
            <Label htmlFor="reason">Reason/Notes</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Enter reason for expense/income"
              rows={3}
            />
          </div>
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
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormModal;
