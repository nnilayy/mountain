import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Globe } from "lucide-react";

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [crunchbaseUrl, setCrunchbaseUrl] = useState("");
  const [companySize, setCompanySize] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Company created successfully",
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });



  const handleSubmit = async () => {
    if (!companyName || !website) {
      toast({
        title: "Validation Error",
        description: "Company name and website are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create company - only send fields that CompanyCreate expects
      await createCompanyMutation.mutateAsync({
        name: companyName,
        website,
        linkedin: linkedinUrl,
        crunchbase: crunchbaseUrl,
        companySize: companySize || null,
        lastAttempt: null,
        decision: null,
      });
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const handleClose = () => {
    setCompanyName("");
    setWebsite("");
    setLinkedinUrl("");
    setCrunchbaseUrl("");
    setCompanySize("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-2 pb-3">
          <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <DialogTitle className="text-lg font-semibold text-center" data-testid="text-modal-title">
            Add New Company
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="company-name" className="text-sm font-medium flex items-center gap-2">
              Company Name
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            </Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Acme Corp"
              className="h-9"
              data-testid="input-company-name"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="company-size" className="text-sm font-medium flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Company Size
            </Label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger className="h-9" data-testid="select-company-size">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1–10">1–10</SelectItem>
                <SelectItem value="11–50">11–50</SelectItem>
                <SelectItem value="51–100">51–100</SelectItem>
                <SelectItem value="101–250">101–250</SelectItem>
                <SelectItem value="251–500">251–500</SelectItem>
                <SelectItem value="501–1,000">501–1,000</SelectItem>
                <SelectItem value="1,001–5,000">1,001–5,000</SelectItem>
                <SelectItem value="5,001–10,000">5,001–10,000</SelectItem>
                <SelectItem value="10,001+">10,001+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Website URL
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            </Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g., acme.com"
              className="h-9"
              data-testid="input-website"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">in</span>
              </div>
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/acme"
              className="h-9"
              data-testid="input-linkedin"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="crunchbase" className="text-sm font-medium flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#0066CC"/>
                <text x="12" y="16" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">cb</text>
              </svg>
              Crunchbase URL
            </Label>
            <Input
              id="crunchbase"
              value={crunchbaseUrl}
              onChange={(e) => setCrunchbaseUrl(e.target.value)}
              placeholder="https://crunchbase.com/organization/acme"
              className="h-9"
              data-testid="input-crunchbase"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createCompanyMutation.isPending}
            data-testid="button-submit"
          >
            {createCompanyMutation.isPending ? "Creating..." : "Add Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
