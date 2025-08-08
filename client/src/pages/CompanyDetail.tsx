import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ExternalLink, Plus, Trash2, Linkedin, MoreVertical, Edit, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Company } from "@shared/schema";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const [, setLocation] = useLocation();
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  const [personToEdit, setPersonToEdit] = useState<any | null>(null);
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    position: "",
    linkedin: "",
    city: "",
    country: ""
  });
  
  const [editPerson, setEditPerson] = useState({
    name: "",
    email: "",
    position: "",
    linkedin: "",
    city: "",
    country: ""
  });
  
  // For now, use local state for people data (until API is ready)
  const [people, setPeople] = useState<any[]>([]);
  
  const companyId = params?.id;

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const company = companies.find(c => c.id === companyId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-xl" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-3 gap-8 max-w-4xl">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-40 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-600">?</span>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold">Company Not Found</h1>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setLocation("/companies")}
            className="gap-2 bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  const openLink = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddPerson = () => {
    if (!newPerson.name || !newPerson.email) {
      alert("Name and Email are required");
      return;
    }

    const personToAdd = {
      id: Date.now().toString(), // Simple ID generation for now
      companyId,
      ...newPerson,
      attempts: 0,
      lastEmailDate: "",
      opened: false,
      openCount: 0,
      clicked: false,
      clickCount: 0,
      resumeOpened: false,
      resumeOpenCount: 0,
      responded: false,
    };

    setPeople(prev => [...prev, personToAdd]);
    
    // Green toast for successful addition
    toast({
      title: "Person Added",
      description: `${newPerson.name} has been added to the team`,
      className: "border-green-500 bg-green-50 text-green-900",
    });
    
    // Reset form and close modal
    setNewPerson({
      name: "",
      email: "",
      position: "",
      linkedin: "",
      city: "",
      country: ""
    });
    setIsAddPersonOpen(false);
  };

  const handleDeletePerson = (personId: string) => {
    const person = people.find(p => p.id === personId);
    setPersonToDelete(personId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (personToDelete) {
      const person = people.find(p => p.id === personToDelete);
      setPeople(prev => prev.filter(person => person.id !== personToDelete));
      
      // Blue toast for deletion
      toast({
        title: "Person Deleted",
        description: `${person?.name} has been removed`,
        className: "border-blue-500 bg-blue-50 text-blue-900",
      });
    }
    setIsDeleteDialogOpen(false);
    setPersonToDelete(null);
  };

  const handleEditPerson = (person: any) => {
    setPersonToEdit(person);
    setEditPerson({
      name: person.name,
      email: person.email,
      position: person.position || "",
      linkedin: person.linkedin || "",
      city: person.city || "",
      country: person.country || ""
    });
    setIsEditPersonOpen(true);
  };

  const handleUpdatePerson = () => {
    if (!editPerson.name || !editPerson.email) {
      alert("Name and Email are required");
      return;
    }

    if (!personToEdit) return;

    // Check if any changes were made
    const hasChanges = 
      editPerson.name !== personToEdit.name ||
      editPerson.email !== personToEdit.email ||
      editPerson.position !== (personToEdit.position || "") ||
      editPerson.linkedin !== (personToEdit.linkedin || "") ||
      editPerson.city !== (personToEdit.city || "") ||
      editPerson.country !== (personToEdit.country || "");

    if (!hasChanges) {
      // No changes made, just close modal
      setIsEditPersonOpen(false);
      setPersonToEdit(null);
      return;
    }

    // Update the person
    setPeople(prev => prev.map(person => 
      person.id === personToEdit.id 
        ? { ...person, ...editPerson }
        : person
    ));

    // Green toast for successful edit
    toast({
      title: "Person Updated",
      description: `Details updated for ${editPerson.name}`,
      className: "border-green-500 bg-green-50 text-green-900",
    });

    // Reset and close
    setEditPerson({
      name: "",
      email: "",
      position: "",
      linkedin: "",
      city: "",
      country: ""
    });
    setIsEditPersonOpen(false);
    setPersonToEdit(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPerson(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditPerson(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with company image, name, links, and back button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* Company placeholder image - bigger */}
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-xl flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-600">
              {company.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Company name and links */}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="flex flex-col gap-3">
              {/* Grid layout for labels and links aligned to left */}
              <div className="grid grid-cols-3 gap-8">
                {/* Website column */}
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-1">
                    <div>Website</div>
                  </div>
                  <div className="font-medium h-6 flex items-center">
                    <span className="text-sm text-blue-600 cursor-pointer hover:underline break-all" onClick={() => openLink(company.website)}>
                      {company.website}
                    </span>
                  </div>
                </div>
                
                {/* LinkedIn column */}
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-1">
                    <div>LinkedIn</div>
                  </div>
                  <div className="font-medium h-6 flex items-center">
                    {company.linkedin ? (
                      <span className="text-sm text-blue-600 cursor-pointer hover:underline break-all" onClick={() => company.linkedin && openLink(company.linkedin)}>
                        {company.linkedin}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">Not available</span>
                    )}
                  </div>
                </div>
                
                {/* Crunchbase column */}
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-1">
                    <div>Crunchbase</div>
                  </div>
                  <div className="font-medium h-6 flex items-center">
                    {company.crunchbase ? (
                      <span className="text-sm text-blue-600 cursor-pointer hover:underline break-all" onClick={() => company.crunchbase && openLink(company.crunchbase)}>
                        {company.crunchbase}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">Not available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setLocation("/companies")}
          className="gap-2 bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Button>
      </div>

      {/* Tabbed Sections */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="statistics">Campaign Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>People</CardTitle>
              <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add People
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Person</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newPerson.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPerson.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newPerson.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder="Enter job position"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={newPerson.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="Enter LinkedIn URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newPerson.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newPerson.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddPersonOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPerson}>
                      Add Person
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Person Dialog */}
              <Dialog open={isEditPersonOpen} onOpenChange={setIsEditPersonOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Person</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name *</Label>
                      <Input
                        id="edit-name"
                        value={editPerson.name}
                        onChange={(e) => handleEditInputChange('name', e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editPerson.email}
                        onChange={(e) => handleEditInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-position">Position</Label>
                      <Input
                        id="edit-position"
                        value={editPerson.position}
                        onChange={(e) => handleEditInputChange('position', e.target.value)}
                        placeholder="Enter job position"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-linkedin">LinkedIn</Label>
                      <Input
                        id="edit-linkedin"
                        value={editPerson.linkedin}
                        onChange={(e) => handleEditInputChange('linkedin', e.target.value)}
                        placeholder="Enter LinkedIn URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-city">City</Label>
                      <Input
                        id="edit-city"
                        value={editPerson.city}
                        onChange={(e) => handleEditInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-country">Country</Label>
                      <Input
                        id="edit-country"
                        value={editPerson.country}
                        onChange={(e) => handleEditInputChange('country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsEditPersonOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdatePerson}>
                      Update Person
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Delete Confirmation Dialog */}
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the person from your list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No people added yet. Click "Add People" to get started.</p>
              ) : (
                <div className="space-y-4">
                  {people.map((person) => (
                    <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        {/* Left side - Person info */}
                        <div className="flex items-center gap-4 flex-1">
                          {/* Person Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-700">
                              {person.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Person Details using Companies page pattern */}
                          <div className="flex-1 grid grid-cols-6 gap-6">
                            {/* Name Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Name</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="font-semibold text-gray-900 text-xs">{person.name}</span>
                              </div>
                            </div>
                            
                            {/* Email Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Email</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-600">{person.email}</span>
                              </div>
                            </div>
                            
                            {/* Position Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Position</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-700">{person.position || "-"}</span>
                              </div>
                            </div>
                            
                            {/* LinkedIn Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>LinkedIn</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                {person.linkedin ? (
                                  <div 
                                    className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                                    onClick={() => window.open(person.linkedin, '_blank', 'noopener,noreferrer')}
                                  >
                                    <span className="text-white text-xs font-bold">in</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </div>
                            </div>
                            
                            {/* City Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>City</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-700">{person.city || "-"}</span>
                              </div>
                            </div>
                            
                            {/* Country Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Country</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-700">{person.country || "-"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Update dropdown on the right */}
                        <div className="flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-1 h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPerson(person)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePerson(person.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Data information will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Schedule information will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Campaign information will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Campaign statistics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
