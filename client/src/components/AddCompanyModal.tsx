import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Person {
  name: string;
  email: string;
  position: string;
  linkedin: string;
}

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [people, setPeople] = useState<Person[]>([
    { name: "", email: "", position: "", linkedin: "" }
  ]);

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

  const createPersonMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/people", data);
      return response.json();
    },
  });

  const addPerson = () => {
    if (people.length < 3) {
      setPeople([...people, { name: "", email: "", position: "", linkedin: "" }]);
    }
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (index: number, field: keyof Person, value: string) => {
    const updated = [...people];
    updated[index][field] = value;
    setPeople(updated);
  };

  const handleSubmit = async () => {
    if (!companyName || !website) {
      toast({
        title: "Validation Error",
        description: "Company name and website are required",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one person has name and email
    const validPeople = people.filter(person => person.name && person.email);
    if (validPeople.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one contact with name and email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create company first
      const company = await createCompanyMutation.mutateAsync({
        name: companyName,
        website,
        linkedin: linkedinUrl,
        totalEmails: 0,
        lastAttempt: null,
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        hasResponded: false,
      });

      // Create people for the company
      for (const person of validPeople) {
        await createPersonMutation.mutateAsync({
          companyId: company.id,
          name: person.name,
          email: person.email,
          position: person.position,
          linkedin: person.linkedin,
          attempts: 0,
          lastEmailDate: null,
          opened: false,
          openCount: 0,
          clicked: false,
          clickCount: 0,
          responded: false,
        });
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const handleClose = () => {
    setCompanyName("");
    setWebsite("");
    setLinkedinUrl("");
    setPeople([{ name: "", email: "", position: "", linkedin: "" }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">Add New Company</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  data-testid="input-company-name"
                />
              </div>
              <div>
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g., acme.com"
                  data-testid="input-website"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/acme"
                data-testid="input-linkedin"
              />
            </div>
          </div>

          {/* People */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Contacts</h3>
              {people.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPerson}
                  data-testid="button-add-person"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Person
                </Button>
              )}
            </div>

            {people.map((person, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Contact {index + 1}</h4>
                  {people.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerson(index)}
                      className="text-destructive hover:bg-destructive/10"
                      data-testid={`button-remove-person-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>Full Name *</Label>
                    <Input
                      id={`name-${index}`}
                      value={person.name}
                      onChange={(e) => updatePerson(index, "name", e.target.value)}
                      placeholder="John Doe"
                      data-testid={`input-person-name-${index}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`position-${index}`}>Position</Label>
                    <Input
                      id={`position-${index}`}
                      value={person.position}
                      onChange={(e) => updatePerson(index, "position", e.target.value)}
                      placeholder="Software Engineer"
                      data-testid={`input-person-position-${index}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`email-${index}`}>Email *</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={person.email}
                      onChange={(e) => updatePerson(index, "email", e.target.value)}
                      placeholder="john@acme.com"
                      data-testid={`input-person-email-${index}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`person-linkedin-${index}`}>LinkedIn</Label>
                    <Input
                      id={`person-linkedin-${index}`}
                      value={person.linkedin}
                      onChange={(e) => updatePerson(index, "linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/johndoe"
                      data-testid={`input-person-linkedin-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
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
