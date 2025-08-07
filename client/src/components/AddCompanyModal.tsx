import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [crunchbaseUrl, setCrunchbaseUrl] = useState("");

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
      // Create company
      await createCompanyMutation.mutateAsync({
        name: companyName,
        website,
        linkedin: linkedinUrl,
        crunchbase: crunchbaseUrl,
        totalEmails: 0,
        totalPeople: 0,
        lastAttempt: null,
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
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

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="company-name" className="text-sm font-medium flex items-center gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              Company Name
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
            <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zM17.9 17.39c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Website URL
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
              <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
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
