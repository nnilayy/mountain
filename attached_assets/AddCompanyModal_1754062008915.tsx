import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface Person {
  name: string;
  email: string;
  position: string;
  linkedin: string;
}

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLinkedIn, setCompanyLinkedIn] = useState('');
  const [people, setPeople] = useState<Person[]>([
    { name: '', email: '', position: '', linkedin: '' }
  ]);

  const addPerson = () => {
    if (people.length < 3) {
      setPeople([...people, { name: '', email: '', position: '', linkedin: '' }]);
    }
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (index: number, field: keyof Person, value: string) => {
    const updatedPeople = [...people];
    updatedPeople[index][field] = value;
    setPeople(updatedPeople);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally POST to your backend API
    console.log('Submitting company:', {
      company: { name: companyName, website: companyWebsite, linkedin: companyLinkedIn },
      people: people.filter(p => p.name && p.email), // Only include people with at least name and email
    });
    
    // Reset form and close modal
    setCompanyName('');
    setCompanyWebsite('');
    setCompanyLinkedIn('');
    setPeople([{ name: '', email: '', position: '', linkedin: '' }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Add a new company to your outreach list and include up to 3 contacts for initial outreach.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="example.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="company-linkedin">LinkedIn URL</Label>
              <Input
                id="company-linkedin"
                value={companyLinkedIn}
                onChange={(e) => setCompanyLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/company/example"
              />
            </div>
          </div>

          {/* People Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">People ({people.length}/3)</h3>
              {people.length < 3 && (
                <Button type="button" variant="outline" onClick={addPerson}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Person
                </Button>
              )}
            </div>

            {people.map((person, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Person {index + 1}</h4>
                  {people.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removePerson(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`person-${index}-name`}>Name *</Label>
                    <Input
                      id={`person-${index}-name`}
                      value={person.name}
                      onChange={(e) => updatePerson(index, 'name', e.target.value)}
                      required={index === 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`person-${index}-email`}>Email *</Label>
                    <Input
                      id={`person-${index}-email`}
                      type="email"
                      value={person.email}
                      onChange={(e) => updatePerson(index, 'email', e.target.value)}
                      required={index === 0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`person-${index}-position`}>Position</Label>
                    <Input
                      id={`person-${index}-position`}
                      value={person.position}
                      onChange={(e) => updatePerson(index, 'position', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`person-${index}-linkedin`}>LinkedIn URL</Label>
                    <Input
                      id={`person-${index}-linkedin`}
                      value={person.linkedin}
                      onChange={(e) => updatePerson(index, 'linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/john-doe"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Company
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}