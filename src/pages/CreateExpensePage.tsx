
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, DollarSign, Clock, Calendar, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for common expense descriptions
const expenseCategories = [
  { label: "Tea", description: "Tea and refreshments", color: "bg-amber-100 text-amber-800" },
  { label: "Transport", description: "Travel and fuel expenses", color: "bg-blue-100 text-blue-800" },
  { label: "Labour", description: "Daily wages and labor charges", color: "bg-red-100 text-red-800" },
  { label: "Office", description: "Office supplies and stationery", color: "bg-green-100 text-green-800" },
  { label: "Marketing", description: "Advertising and promotion", color: "bg-purple-100 text-purple-800" },
  { label: "Utilities", description: "Electricity, water, internet", color: "bg-gray-100 text-gray-800" },
  { label: "Equipment", description: "Tools and machinery", color: "bg-indigo-100 text-indigo-800" },
  { label: "Maintenance", description: "Repairs and upkeep", color: "bg-teal-100 text-teal-800" },
];

// Mock data for layouts and common names (vendors/people)
const layouts = ["PS1 Layout", "PS2 Layout", "PS3 Layout"];
const commonNames = [
  "Suresh", 
  "Ramesh", 
  "Tea Supplier", 
  "Raju Construction", 
  "Marketing Services",
  "Local Tea Shop",
  "HTGTA",
  "Ramesh Driver"
];

const CreateExpensePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    name: "",
    amount: "",
    date: "",
    layout: "",
    notes: ""
  });
  
  const [customCategory, setCustomCategory] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [similarExpenses, setSimilarExpenses] = useState<{description: string; date: string; amount: number}[]>([]);
  
  // Set current date as default
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: formattedDate }));
    
    document.title = "Add Expense | PS2 Estate Nexus";
  }, []);
  
  // Show similar expenses when description or name is selected
  useEffect(() => {
    if (formData.description || formData.name) {
      // Simulate fetching similar expenses
      setTimeout(() => {
        if (formData.description === "Tea") {
          setSimilarExpenses([
            { description: "Tea for morning meeting", date: "2025-04-21", amount: 250 },
            { description: "Tea and snacks", date: "2025-04-20", amount: 300 },
            { description: "Tea for staff", date: "2025-04-18", amount: 180 }
          ]);
        } else if (formData.description === "Labour") {
          setSimilarExpenses([
            { description: "Labour for site clearing", date: "2025-04-19", amount: 12000 },
            { description: "Labour charges", date: "2025-04-15", amount: 8500 }
          ]);
        } else if (formData.name === "Suresh" || formData.name === "Tea Supplier") {
          setSimilarExpenses([
            { description: "Tea supply", date: "2025-04-22", amount: 450 },
            { description: "Refreshments", date: "2025-04-17", amount: 650 }
          ]);
        } else {
          setSimilarExpenses([]);
        }
      }, 300);
    } else {
      setSimilarExpenses([]);
    }
  }, [formData.description, formData.name]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.description || !formData.name || !formData.amount || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate API call
    toast({
      title: "Processing...",
      description: "Saving expense data"
    });
    
    // Simulate success after delay
    setTimeout(() => {
      // Show success message
      toast({
        title: "Expense Added",
        description: `₹${parseFloat(formData.amount).toLocaleString('en-IN')} for ${formData.description} has been recorded`,
      });
      
      // Redirect to expenses list
      navigate("/expenses");
    }, 800);
  };
  
  // Use a similar expense as template
  const useSimilarExpense = (expense: {description: string; amount: number}) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description || expense.description,
      amount: String(expense.amount)
    }));
    
    toast({
      title: "Template Applied",
      description: "Similar expense details have been applied",
    });
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (category === "custom") {
      setCustomCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setCustomCategory(false);
      setFormData({ ...formData, category, description: category });
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-gray-600">Record a new expense transaction</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Enter information about this expense</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Expense Description/Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Expense Category</Label>
                {!customCategory ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {expenseCategories.map((category) => (
                      <div
                        key={category.label}
                        className={cn(
                          "flex items-center justify-center p-2 rounded-md border cursor-pointer transition-colors",
                          formData.category === category.label
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => handleCategorySelect(category.label)}
                      >
                        <div className="text-center">
                          <Badge variant="outline" className={category.color}>
                            {category.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    <div
                      className={cn(
                        "flex items-center justify-center p-2 rounded-md border cursor-pointer transition-colors",
                        customCategory
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                      onClick={() => handleCategorySelect("custom")}
                    >
                      <div className="text-center">
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Custom
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Enter custom category"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCustomCategory(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Expense Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the expense"
                  required
                />
              </div>
              
              {/* Name (Vendor/Person) */}
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                    >
                      {formData.name || "Select name..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search names..." />
                      <CommandEmpty>No name found. Use as new.</CommandEmpty>
                      <CommandGroup>
                        {commonNames.map((name) => (
                          <CommandItem
                            key={name}
                            onSelect={() => {
                              setFormData({ ...formData, name });
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.name === name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">
                  If the name doesn't exist, just type it directly
                </p>
              </div>
              
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                {/* Layout (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="layout">Related Layout (Optional)</Label>
                  <Select name="layout" value={formData.layout} onValueChange={(value) => setFormData({ ...formData, layout: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {layouts.map((layout) => (
                        <SelectItem key={layout} value={layout}>
                          {layout}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information about this expense"
                  rows={3}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/expenses")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-ps2-primary hover:bg-ps2-secondary">
                <Save size={18} className="mr-2" />
                Save Expense
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Similar expenses suggestions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Similar Expenses</CardTitle>
            <CardDescription>
              Recent similar expenses that might help you
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {similarExpenses.length > 0 ? (
              <div className="space-y-3">
                {similarExpenses.map((expense, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{expense.description}</p>
                        <Button variant="ghost" size="sm" onClick={() => useSimilarExpense(expense)}>
                          Use
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                        <span className="font-medium text-green-600">₹{expense.amount}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No similar expenses found</p>
                <p className="text-sm mt-1">
                  Select a category or enter a name to see similar expenses
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateExpensePage;
