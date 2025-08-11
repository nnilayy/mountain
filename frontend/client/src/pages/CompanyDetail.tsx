import { useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ExternalLink, Plus, Trash2, Linkedin, MoreVertical, Edit, Edit2, UserX, Upload, Eye, Calendar, Target, Mail, BarChart3, ChevronLeft, ChevronRight, ChevronDown, Users, TrendingUp, Check, Info, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CircularProgressBlue } from "@/components/ui/circular-progress-blue";
import { toast } from "@/hooks/use-toast";
import { Company } from "@shared/schema";
import { format } from "date-fns";

// Company size constants for consistency across the application
export const COMPANY_SIZE_OPTIONS = [
  "1–10",
  "11–50", 
  "51–100",
  "101–250",
  "251–500",
  "501–1,000",
  "1,001–5,000",
  "5,001–10,000",
  "10,001+"
] as const;

export type CompanySize = typeof COMPANY_SIZE_OPTIONS[number];

function getCompanySizeColor(size: string | null) {
  if (!size) return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
  
  // Define standard company size ranges and their colors
  switch (size) {
    case "1–10":
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700";
    case "11–50":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
    case "51–100":
    case "101–250":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
    case "251–500":
    case "501–1,000":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700";
    case "1,001–5,000":
    case "5,001–10,000":
    case "10,001+":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700";
    default:
      // Fallback for any legacy/unknown values
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
  }
}

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
  
  // Data section state
  const [dataSection, setDataSection] = useState({
    resumeLink: "",
    coverLetter: "",
    emailContent1: "",
    emailContent2: "",
    emailContent3: ""
  });
  
  // Email status state for schedules
  const [emailStatuses, setEmailStatuses] = useState<Record<string, { firstEmail: string; secondEmail: string; thirdEmail: string }>>({});
  
  // Store persistent dates for scheduled emails
  const [scheduledDates, setScheduledDates] = useState<Record<string, { firstEmail: string; secondEmail: string; thirdEmail: string }>>({});
  
  // Campaign decisions and statuses state
  const [campaignDecisions, setCampaignDecisions] = useState<Record<string, string>>({});
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>({});
  
  // Edit company modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState({
    name: "",
    website: "",
    linkedin: "",
    crunchbase: "",
    companySize: ""
  });

  // Delete company modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update schedule confirmation dialog
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

  const [calendarModal, setCalendarModal] = useState<{
    isOpen: boolean;
    personId: string;
    personName: string;
    emailType: 'firstEmail' | 'secondEmail' | 'thirdEmail';
    currentDate: Date;
    viewingDate: Date; // Separate date for calendar navigation
  }>({
    isOpen: false,
    personId: "",
    personName: "",
    emailType: "firstEmail",
    currentDate: new Date(),
    viewingDate: new Date()
  });
  
  // Info popup states
  const [emailViewsModal, setEmailViewsModal] = useState<{ isOpen: boolean; personId: string; personName: string }>({ isOpen: false, personId: "", personName: "" });
  const [resumeViewsModal, setResumeViewsModal] = useState<{ isOpen: boolean; personId: string; personName: string }>({ isOpen: false, personId: "", personName: "" });
  const [responseModal, setResponseModal] = useState<{ isOpen: boolean; personId: string; personName: string; response: string }>({ isOpen: false, personId: "", personName: "", response: "" });
  
  // Campaign data and active campaign state
  const [activeCampaign, setActiveCampaign] = useState(0);
  const [expandedPersons, setExpandedPersons] = useState<Record<string, boolean>>({});
  const [campaigns] = useState([
    {
      id: 1,
      name: "Q1 Outreach Campaign",
      status: "Active",
      description: "Primary outreach campaign targeting software engineers and product managers for Q1 hiring.",
      emails: 45,
      responses: 12,
      interviews: 3,
      startDate: "2024-01-15",
      endDate: "2024-03-31",
      successRate: 26.7,
      emailTemplates: [
        "Subject: Exciting Software Engineer Opportunity at [Company]\n\nHi [Name],\n\nI hope this email finds you well...",
        "Subject: Following up on Software Engineer Role\n\nHi [Name],\n\nI wanted to follow up on my previous email...",
        "Subject: Final opportunity - Software Engineer Position\n\nHi [Name],\n\nThis is my final follow-up regarding..."
      ],
      targetRoles: ["Software Engineer", "Full Stack Developer", "Frontend Developer"],
      targetCompanies: ["Tech Corp", "Startup Inc", "Innovation Labs"]
    },
    {
      id: 2,
      name: "Senior Developer Hunt",
      status: "Completed",
      description: "Focused campaign for senior developer positions with 5+ years experience.",
      emails: 23,
      responses: 8,
      interviews: 5,
      startDate: "2023-11-01",
      endDate: "2023-12-31",
      successRate: 34.8,
      emailTemplates: [
        "Subject: Senior Developer Opportunity - Remote Friendly\n\nHi [Name],\n\nI came across your profile and was impressed...",
        "Subject: Re: Senior Developer Position\n\nHi [Name],\n\nI wanted to reach out again about...",
        "Subject: Last chance - Senior Developer Role\n\nHi [Name],\n\nI don't want you to miss out on this opportunity..."
      ],
      targetRoles: ["Senior Software Engineer", "Lead Developer", "Principal Engineer"],
      targetCompanies: ["Enterprise Solutions", "Scale Corp", "DevOps Pro"]
    },
    {
      id: 3,
      name: "Remote Talent Search",
      status: "Paused",
      description: "Campaign targeting remote-friendly candidates for distributed team positions.",
      emails: 18,
      responses: 3,
      interviews: 1,
      startDate: "2024-02-01",
      endDate: "2024-04-30",
      successRate: 16.7,
      emailTemplates: [
        "Subject: Remote-First Company Looking for Talent\n\nHi [Name],\n\nWe're a fully remote company...",
        "Subject: Work From Anywhere - Development Role\n\nHi [Name],\n\nFollowing up on our remote opportunity...",
        "Subject: Final call - Remote Developer Position\n\nHi [Name],\n\nThis is my last attempt to connect..."
      ],
      targetRoles: ["Remote Developer", "Distributed Systems Engineer", "Cloud Engineer"],
      targetCompanies: ["Remote First Co", "Global Tech", "Anywhere Inc"]
    }
  ]);
  
  // Modal states for email content viewing and editing
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentEmailContent, setCurrentEmailContent] = useState("");
  const [currentEmailTitle, setCurrentEmailTitle] = useState("");
  const [editingEmailContent, setEditingEmailContent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  // File upload refs
  const resumeUploadRef = useRef<HTMLInputElement>(null);
  const coverLetterUploadRef = useRef<HTMLInputElement>(null);
  
  const companyId = params?.id;
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const company = companies.find(c => c.id === companyId);

  // Edit company mutation
  const editCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/companies/${companyId}`, data);
      if (!response.ok) {
        throw new Error("Failed to update company");
      }
      return response.json();
    },
    onSuccess: (updatedCompany) => {
      // Update the companies cache with the new data
      queryClient.setQueryData(["/api/companies"], (oldCompanies: Company[] | undefined) => {
        if (!oldCompanies) return oldCompanies;
        return oldCompanies.map(c => c.id === companyId ? updatedCompany : c);
      });
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      
      toast({
        title: "Success",
        description: "Company updated successfully",
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
      
      setShowEditModal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/companies/${companyId}`);
      if (!response.ok) {
        throw new Error("Failed to delete company");
      }
      return response.json();
    },
    onSuccess: () => {
      // Remove company from cache
      queryClient.setQueryData(["/api/companies"], (oldCompanies: Company[] | undefined) => {
        if (!oldCompanies) return oldCompanies;
        return oldCompanies.filter(c => c.id !== companyId);
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
      
      // Redirect to companies page
      setLocation("/companies");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    },
  });

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
          <Skeleton className="h-10 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
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
            className="gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
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
      className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
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
        className: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 dark:border-blue-400",
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
      className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
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

  // File upload handlers
  const handleResumeUpload = () => {
    resumeUploadRef.current?.click();
  };

  const handleCoverLetterUpload = () => {
    coverLetterUploadRef.current?.click();
  };

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Resume Uploaded",
        description: `${file.name} has been uploaded successfully`,
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
      // Here you would typically upload the file to your server
    }
  };

  const handleCoverLetterFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Cover Letter Uploaded",
        description: `${file.name} has been uploaded successfully`,
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
      // Here you would typically upload the file to your server
    }
  };

  // Schedule all handler
  const handleScheduleAll = () => {
    const updatedStatuses: Record<string, { firstEmail: string; secondEmail: string; thirdEmail: string }> = {};
    
    people.forEach(person => {
      updatedStatuses[person.id] = {
        firstEmail: "Scheduled",
        secondEmail: "Scheduled",
        thirdEmail: "Scheduled"
      };
    });
    
    setEmailStatuses(prev => ({
      ...prev,
      ...updatedStatuses
    }));
    
    const unscheduledCount = getUnscheduledPeople().length;
    const isSchedulingRemaining = unscheduledCount > 0 && unscheduledCount < people.length;
    
    toast({
      title: isSchedulingRemaining ? "Remaining Scheduled" : "All Scheduled",
      description: `Email schedules created for ${isSchedulingRemaining ? unscheduledCount : people.length} people`,
      className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
    });
  };

  // Helper function to get unscheduled people
  const getUnscheduledPeople = () => {
    return people.filter(person => {
      const personStatus = emailStatuses[person.id];
      return !personStatus || 
        personStatus.firstEmail !== "Scheduled" || 
        personStatus.secondEmail !== "Scheduled" || 
        personStatus.thirdEmail !== "Scheduled";
    });
  };

  // Generate random date for emails
  const generateRandomDate = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30); // Random date within next 30 days
    
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const randomDate = new Date(randomTime);
    
    return randomDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get or generate persistent scheduled date
  const getScheduledDate = (personId: string, emailType: 'firstEmail' | 'secondEmail' | 'thirdEmail') => {
    // Check if we already have a date stored for this person and email type
    if (scheduledDates[personId] && scheduledDates[personId][emailType]) {
      return scheduledDates[personId][emailType];
    }
    
    // Generate a new date and store it
    const newDate = generateRandomDate();
    setScheduledDates(prev => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        [emailType]: newDate
      }
    }));
    
    return newDate;
  };

  // Update scheduled date function
  const updateScheduledDate = (newDate: Date) => {
    const formattedDate = format(newDate, 'MMM d, yyyy');
    setScheduledDates(prev => ({
      ...prev,
      [calendarModal.personId]: {
        ...prev[calendarModal.personId],
        [calendarModal.emailType]: formattedDate
      }
    }));
    
    // Show success toast
    const emailNumber = calendarModal.emailType === 'firstEmail' ? 'First' : calendarModal.emailType === 'secondEmail' ? 'Second' : 'Third';
    toast({
      title: "Schedule Updated",
      description: `${emailNumber} email schedule updated to ${formattedDate}`,
      className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
    });
    
    // Close calendar modal
    setCalendarModal(prev => ({ ...prev, isOpen: false }));
  };

  // Helper function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    const events = [];
    const dayOfWeek = date.getDay();
    
    // Add weekend events
    if (dayOfWeek === 0) {
      events.push({ type: 'holiday', title: 'Sunday', color: 'text-blue-600' });
    } else if (dayOfWeek === 6) {
      events.push({ type: 'holiday', title: 'Saturday', color: 'text-blue-600' });
    }
    
    return events;
  };

  // Get events for the current month
  const getMonthEvents = (date: Date) => {
    const events = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        events.push({
          date: day,
          title: dayOfWeek === 0 ? 'Sunday' : 'Saturday',
          type: 'holiday',
          color: 'text-blue-600'
        });
      }
    }
    
    return events;
  };

  // Clickable Date component
  const ClickableDate = ({ 
    personId, 
    personName,
    emailType, 
    date, 
    isScheduled 
  }: { 
    personId: string; 
    personName: string;
    emailType: 'firstEmail' | 'secondEmail' | 'thirdEmail'; 
    date: string; 
    isScheduled: boolean;
  }) => {
    if (!isScheduled) {
      return <span className="text-muted-foreground">-</span>;
    }

    const handleDateClick = () => {
      // Parse the current date or use today's date
      let currentDate = new Date();
      try {
        currentDate = new Date(date);
        if (isNaN(currentDate.getTime())) {
          currentDate = new Date();
        }
      } catch (error) {
        currentDate = new Date();
      }

      setCalendarModal({
        isOpen: true,
        personId,
        personName,
        emailType,
        currentDate,
        viewingDate: currentDate // Set viewing date to the current date when opening
      });
    };

    return (
      <Button
        variant="ghost"
        className="h-auto p-1 text-sm font-normal hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
        onClick={handleDateClick}
      >
        <CalendarDays className="w-3 h-3 mr-1" />
        {date}
      </Button>
    );
  };

  // Get button text based on scheduling status
  const getScheduleButtonText = () => {
    const unscheduledCount = getUnscheduledPeople().length;
    if (unscheduledCount === 0) return "All Scheduled";
    if (unscheduledCount === people.length) return "Schedule All";
    return "Schedule Remaining";
  };

  // Toggle person expansion in campaign details
  const togglePersonExpansion = (personId: string) => {
    setExpandedPersons(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  };

  // Functions to manage campaign decisions and statuses
  const setCampaignDecision = (personId: string, decision: string) => {
    setCampaignDecisions(prev => ({
      ...prev,
      [personId]: decision
    }));
  };

  const setCampaignStatus = (personId: string, status: string) => {
    setCampaignStatuses(prev => ({
      ...prev,
      [personId]: status
    }));
  };

  const getCampaignDecision = (personId: string) => {
    return campaignDecisions[personId] || "No";
  };

  const getCampaignStatus = (personId: string) => {
    return campaignStatuses[personId] || "Active";
  };

  return (
    <div className="space-y-6">
      {/* Company banner box */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6 flex-1">
            {/* Company placeholder image */}
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-gray-600">
                {company.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Company name and links */}
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
                {/* Company Size */}
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-1">
                    Company Size
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getCompanySizeColor(company.companySize)}`}>
                      {company.companySize || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Links grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Website column */}
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-1">
                    Website
                  </div>
                  <div className="font-medium h-6 flex items-center">
                    <span 
                      className="text-sm text-blue-600 cursor-pointer hover:underline break-all truncate" 
                      onClick={() => openLink(company.website)}
                      title={company.website}
                    >
                      {company.website}
                    </span>
                  </div>
                </div>
                
                {/* LinkedIn column */}
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-1">
                    LinkedIn
                  </div>
                  <div className="font-medium h-6 flex items-center">
                    {company.linkedin ? (
                      <span 
                        className="text-sm text-blue-600 cursor-pointer hover:underline break-all truncate" 
                        onClick={() => company.linkedin && openLink(company.linkedin)}
                        title={company.linkedin}
                      >
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
                    Crunchbase
                  </div>
                  <div className="font-medium h-6 flex items-center">
                    {company.crunchbase ? (
                      <span 
                        className="text-sm text-blue-600 cursor-pointer hover:underline break-all truncate" 
                        onClick={() => company.crunchbase && openLink(company.crunchbase)}
                        title={company.crunchbase}
                      >
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

          {/* Options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => {
                  setEditCompanyData({
                    name: company.name,
                    website: company.website || "",
                    linkedin: company.linkedin || "",
                    crunchbase: company.crunchbase || "",
                    companySize: company.companySize || ""
                  });
                  setShowEditModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Company
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete Company
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabbed Sections */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            People
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Campaign Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>People</CardTitle>
                <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add People
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No People Added</h3>
                  <p className="text-muted-foreground">Click "Add People" to get started with your outreach.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {people.map((person) => (
                    <div key={person.id} className="bg-card rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm dark:hover:shadow-gray-700/25 transition-shadow">
                      <div className="flex items-center justify-between">
                        {/* Left side - Person info */}
                        <div className="flex items-center gap-4 flex-1">
                          {/* Person Avatar */}
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
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
                                <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{person.name}</span>
                              </div>
                            </div>
                            
                            {/* Email Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Email</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-600 dark:text-gray-300">{person.email}</span>
                              </div>
                            </div>
                            
                            {/* Position Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Position</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-700 dark:text-gray-200">{person.position || "-"}</span>
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
                                <span className="text-xs text-gray-700 dark:text-gray-200">{person.city || "-"}</span>
                              </div>
                            </div>
                            
                            {/* Country Column */}
                            <div className="flex flex-col items-center px-2">
                              <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                <div>Country</div>
                              </div>
                              <div className="font-medium text-center h-6 flex items-center">
                                <span className="text-xs text-gray-700 dark:text-gray-200">{person.country || "-"}</span>
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
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 h-8 w-8"
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

          {/* Add Person Dialog */}
          <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
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
        </TabsContent>
        
        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center py-1.5">
                <CardTitle>Data</CardTitle>
                <div></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resume Link Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Resume Link</Label>
                <div className="flex gap-3">
                  <Select value={dataSection.resumeLink} onValueChange={(value) => setDataSection(prev => ({...prev, resumeLink: value}))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select resume version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume-v1">Resume v1.0 - General</SelectItem>
                      <SelectItem value="resume-v2">Resume v2.0 - Tech Focus</SelectItem>
                      <SelectItem value="resume-v3">Resume v3.0 - Management</SelectItem>
                      <SelectItem value="resume-custom">Custom Resume</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleResumeUpload}>
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>
                {/* Hidden file input for resume */}
                <input
                  ref={resumeUploadRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Cover Letter Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Cover Letter</Label>
                <div className="flex gap-3">
                  <Select value={dataSection.coverLetter} onValueChange={(value) => setDataSection(prev => ({...prev, coverLetter: value}))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select cover letter template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover-generic">Generic Cover Letter</SelectItem>
                      <SelectItem value="cover-tech">Tech Company Template</SelectItem>
                      <SelectItem value="cover-startup">Startup Template</SelectItem>
                      <SelectItem value="cover-enterprise">Enterprise Template</SelectItem>
                      <SelectItem value="cover-custom">Custom Cover Letter</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCoverLetterUpload}>
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>
                {/* Hidden file input for cover letter */}
                <input
                  ref={coverLetterUploadRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCoverLetterFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Email Content Sections */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Email Contents</Label>
                
                {/* First Email */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">First Email - Initial Outreach</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setCurrentEmailContent(dataSection.emailContent1 || "");
                        setEditingEmailContent(dataSection.emailContent1 || "");
                        setCurrentEmailTitle("First Email - Initial Outreach");
                        setIsEditMode(false);
                        setIsEmailModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Enter your initial outreach email content..."
                      value={dataSection.emailContent1}
                      readOnly
                      tabIndex={-1}
                      rows={2}
                      className="resize-none bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-700 border-gray-200 dark:border-gray-700 pointer-events-none overflow-hidden scrollbar-hide"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 via-gray-50/80 dark:from-gray-800 dark:via-gray-800/80 to-transparent pointer-events-none rounded-b-md"></div>
                  </div>
                </div>

                {/* Second Email */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Second Email - Follow-up</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setCurrentEmailContent(dataSection.emailContent2 || "");
                        setEditingEmailContent(dataSection.emailContent2 || "");
                        setCurrentEmailTitle("Second Email - Follow-up");
                        setIsEditMode(false);
                        setIsEmailModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Enter your follow-up email content..."
                      value={dataSection.emailContent2}
                      readOnly
                      tabIndex={-1}
                      rows={2}
                      className="resize-none bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-700 border-gray-200 dark:border-gray-700 pointer-events-none overflow-hidden scrollbar-hide"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 via-gray-50/80 dark:from-gray-800 dark:via-gray-800/80 to-transparent pointer-events-none rounded-b-md"></div>
                  </div>
                </div>

                {/* Third Email */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Third Email - Final Follow-up</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setCurrentEmailContent(dataSection.emailContent3 || "");
                        setEditingEmailContent(dataSection.emailContent3 || "");
                        setCurrentEmailTitle("Third Email - Final Follow-up");
                        setIsEditMode(false);
                        setIsEmailModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Enter your final follow-up email content..."
                      value={dataSection.emailContent3}
                      readOnly
                      tabIndex={-1}
                      rows={2}
                      className="resize-none bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-700 border-gray-200 dark:border-gray-700 pointer-events-none overflow-hidden scrollbar-hide"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 via-gray-50/80 dark:from-gray-800 dark:via-gray-800/80 to-transparent pointer-events-none rounded-b-md"></div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={() => {
                  toast({
                    title: "Data Saved",
                    description: "All data has been saved successfully",
                    className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
                  });
                }}>
                  Save Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Content Preview/Edit Modal */}
          <Dialog 
            open={isEmailModalOpen} 
            onOpenChange={(open) => {
              if (!open) {
                setEditingEmailContent(""); // Clear editing content when closing
                setIsEditMode(false); // Reset to preview mode
              }
              setIsEmailModalOpen(open);
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader className="space-y-2 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1"></div>
                  <DialogTitle className="text-xl font-semibold text-center whitespace-nowrap">{currentEmailTitle}</DialogTitle>
                  <div className="flex-1"></div>
                </div>
              </DialogHeader>
              <div className="flex-1 min-h-0">
                {isEditMode ? (
                  <Textarea
                    placeholder="Enter your email content here..."
                    value={editingEmailContent}
                    onChange={(e) => setEditingEmailContent(e.target.value)}
                    className="w-full h-96 resize-none text-sm leading-relaxed bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm p-4">
                      {currentEmailContent || "No content available"}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={() => {
                      setIsEditMode(false);
                      setEditingEmailContent("");
                    }}>
                      Cancel Edit
                    </Button>
                    <Button 
                      onClick={() => {
                        // Save the edited content
                        const finalContent = editingEmailContent;
                        if (currentEmailTitle.includes("First Email")) {
                          setDataSection(prev => ({...prev, emailContent1: finalContent}));
                        } else if (currentEmailTitle.includes("Second Email")) {
                          setDataSection(prev => ({...prev, emailContent2: finalContent}));
                        } else if (currentEmailTitle.includes("Third Email")) {
                          setDataSection(prev => ({...prev, emailContent3: finalContent}));
                        }
                        
                        setCurrentEmailContent(finalContent); // Update preview content
                        
                        toast({
                          title: "Email Content Saved",
                          description: "Your changes have been saved successfully",
                          className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
                        });
                        
                        setIsEditMode(false);
                        setEditingEmailContent(""); // Clear editing content
                      }}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setEditingEmailContent(currentEmailContent);
                      setIsEditMode(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader>
              {people.length > 0 && (
                <div className="flex justify-between items-center">
                  <CardTitle>Schedules</CardTitle>
                  <Button 
                    onClick={handleScheduleAll} 
                    className="gap-2"
                    disabled={getUnscheduledPeople().length === 0}
                  >
                    <Calendar className="w-4 h-4" />
                    {getScheduleButtonText()}
                  </Button>
                </div>
              )}
              {people.length === 0 && (
                <div className="flex justify-between items-center py-1.5">
                  <CardTitle>Schedules</CardTitle>
                  <div></div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Current Schedules</h3>
                  <p className="text-muted-foreground">Add people in the People section to create schedules.</p>
                </div>
              ) : (
                <div>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/5">People</TableHead>
                        <TableHead className="w-1/5">First Email</TableHead>
                        <TableHead className="w-1/5">Second Email</TableHead>
                        <TableHead className="w-1/5">Third Email</TableHead>
                        <TableHead className="w-1/5 text-center">Scheduling Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {people.map((person) => {
                        const personStatus = emailStatuses[person.id] || {
                          firstEmail: "Not yet Scheduled",
                          secondEmail: "Not yet Scheduled", 
                          thirdEmail: "Not yet Scheduled"
                        };
                        
                        return (
                          <TableRow key={person.id}>
                            <TableCell className="w-1/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                    {person.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{person.name}</div>
                                  <div className="text-sm text-muted-foreground">{person.email}</div>
                                  {person.position && (
                                    <div className="text-xs text-muted-foreground">{person.position}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-1/5">
                              <ClickableDate
                                personId={person.id}
                                personName={person.name}
                                emailType="firstEmail"
                                date={getScheduledDate(person.id, 'firstEmail')}
                                isScheduled={personStatus.firstEmail === "Scheduled"}
                              />
                            </TableCell>
                            <TableCell className="w-1/5">
                              <ClickableDate
                                personId={person.id}
                                personName={person.name}
                                emailType="secondEmail"
                                date={getScheduledDate(person.id, 'secondEmail')}
                                isScheduled={personStatus.secondEmail === "Scheduled"}
                              />
                            </TableCell>
                            <TableCell className="w-1/5">
                              <ClickableDate
                                personId={person.id}
                                personName={person.name}
                                emailType="thirdEmail"
                                date={getScheduledDate(person.id, 'thirdEmail')}
                                isScheduled={personStatus.thirdEmail === "Scheduled"}
                              />
                            </TableCell>
                            <TableCell className="w-1/5 text-center">
                              <Badge variant={
                                personStatus.firstEmail === "Scheduled" && 
                                personStatus.secondEmail === "Scheduled" && 
                                personStatus.thirdEmail === "Scheduled" ? "default" : "secondary"
                              }>
                                {personStatus.firstEmail === "Scheduled" && 
                                 personStatus.secondEmail === "Scheduled" && 
                                 personStatus.thirdEmail === "Scheduled" ? "Scheduled" : "Unscheduled"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center py-1.5">
                <CardTitle>
                  Campaigns
                </CardTitle>
                <div></div>
              </div>
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Current Campaigns</h3>
                  <p className="text-muted-foreground">Add people to start a campaign and track your outreach progress.</p>
                </div>
              ) : (
                <>
                  {/* Campaign Navigation Slider */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveCampaign(prev => Math.max(prev - 1, 0))}
                      disabled={activeCampaign === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <div className="flex gap-2">
                      {campaigns.map((_, index) => (
                        <Button
                          key={index}
                          variant={activeCampaign === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCampaign(index)}
                        >
                          Campaign {index + 1}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveCampaign(prev => Math.min(prev + 1, campaigns.length - 1))}
                      disabled={activeCampaign === campaigns.length - 1}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Active Campaign Content */}
                  {campaigns[activeCampaign] && (
                    <div className="space-y-6">
                      {/* People in Campaign */}
                      <div className="space-y-3">
                        {people.map((person, index) => {
                            // Mock campaign progress data for each person
                            // Reach attempt should match the current campaign number (1, 2, or 3)
                            const reachAttempt = activeCampaign + 1; // activeCampaign is 0-indexed, so +1 for display
                            const emailOpened = Math.random() > 0.4; // 60% chance of email being opened
                            const emailViews = Math.floor(Math.random() * 8) + 1; // 1-8 email views
                            const resumeOpened = emailOpened && Math.random() > 0.6; // Only if email opened, 40% chance
                            const resumeViews = resumeOpened ? Math.floor(Math.random() * 5) + 1 : 0; // 1-5 resume views if opened
                            
                            // Get scheduled data from Schedules section
                            const personEmailStatus = emailStatuses[person.id] || {
                              firstEmail: "Not yet Scheduled",
                              secondEmail: "Not yet Scheduled", 
                              thirdEmail: "Not yet Scheduled"
                            };
                            
                            // Determine which email status to use based on active campaign (0=first, 1=second, 2=third)
                            let isScheduled = false;
                            let scheduledDate = "-";
                            
                            if (activeCampaign === 0 && personEmailStatus.firstEmail === "Scheduled") {
                              isScheduled = true;
                              scheduledDate = getScheduledDate(person.id, 'firstEmail');
                            } else if (activeCampaign === 1 && personEmailStatus.secondEmail === "Scheduled") {
                              isScheduled = true;
                              scheduledDate = getScheduledDate(person.id, 'secondEmail');
                            } else if (activeCampaign === 2 && personEmailStatus.thirdEmail === "Scheduled") {
                              isScheduled = true;
                              scheduledDate = getScheduledDate(person.id, 'thirdEmail');
                            }
                            
                            // Sent status should only be possible if scheduled
                            const sentStatus = isScheduled ? (Math.random() > 0.7 ? (Math.random() > 0.5 ? "Yes" : "No") : "Not Yet") : "No";
                            
                            // Response received logic matching Dashboard format
                            const responseReceived = Math.random() > 0.7 ? (Math.random() > 0.5 ? "Yes" : "No") : "Not Yet";
                            
                            return (
                              <Card key={person.email} className="overflow-hidden">
                                <CardContent className="p-0">
                                  <div className="px-3 py-3 lg:px-6 lg:py-4 bg-card">
                                    <div className="flex gap-2 items-end text-xs lg:text-sm">
                                      {/* Person Column */}
                                      <div className="flex-[2] px-2 flex items-center justify-start h-full">
                                        <div className="flex items-center gap-3">
                                          {/* Person Avatar */}
                                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                              {person.name.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          
                                          <div className="flex flex-col flex-1 min-w-0">
                                            <div className="font-semibold text-foreground truncate">
                                              {person.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">{person.email}</div>
                                            <div className="text-xs text-muted-foreground truncate">{person.position}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Reach Attempt Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Reach</div>
                                          <div>Attempt</div>
                                        </div>
                                        <div className="font-medium text-center h-6 flex items-center justify-center">
                                          <CircularProgressBlue 
                                            value={reachAttempt} 
                                            total={3} 
                                            size="sm"
                                            showFraction={true}
                                            showPercentage={false}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Scheduled Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Scheduled</div>
                                          <div>Date</div>
                                        </div>
                                        <div className="font-medium text-center h-6 flex items-center text-xs whitespace-nowrap">
                                          {scheduledDate === "-" ? (
                                            <span className="text-muted-foreground">-</span>
                                          ) : (
                                            scheduledDate
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Sent Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Sent</div>
                                          <div>Status</div>
                                        </div>
                                        <div className="font-medium text-center h-6 flex items-center justify-center">
                                          <span className={`text-xs px-2 py-1 rounded-full border ${
                                            sentStatus === "Yes" 
                                              ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                              : sentStatus === "No"
                                              ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                              : "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                                          }`}>
                                            {sentStatus}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Email Views Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Email</div>
                                          <div className="flex items-center justify-center gap-1">
                                            <span>Views</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEmailViewsModal({ isOpen: true, personId: person.id, personName: person.name })}
                                              className="h-3 w-3 p-0 text-muted-foreground hover:text-foreground flex-shrink-0 flex items-center justify-center"
                                            >
                                              <Info className="h-1 w-1" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="font-medium text-center h-6 flex items-center justify-center text-sm">
                                          <span className={emailViews === 0 ? "text-red-600" : "text-green-600"}>
                                            {emailViews}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Resume Views Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Resume</div>
                                          <div className="flex items-center justify-center gap-1">
                                            <span>Views</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setResumeViewsModal({ isOpen: true, personId: person.id, personName: person.name })}
                                              className="h-3 w-3 p-0 text-muted-foreground hover:text-foreground flex-shrink-0 flex items-center justify-center"
                                            >
                                              <Info className="h-1 w-1" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="font-medium text-center h-6 flex items-center justify-center text-sm">
                                          <span className={resumeViews === 0 ? "text-red-600" : "text-green-600"}>
                                            {resumeViews}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Response Received Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Response</div>
                                          <div className="flex items-center justify-center gap-1">
                                            <span>Received</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setResponseModal({ isOpen: true, personId: person.id, personName: person.name, response: responseReceived })}
                                              className="h-3 w-3 p-0 text-muted-foreground hover:text-foreground flex-shrink-0 flex items-center justify-center"
                                            >
                                              <Info className="h-1 w-1" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="font-medium text-center h-6 flex items-center justify-center">
                                          <span className={`text-xs px-2 py-1 rounded-full border ${
                                            responseReceived === "Yes" 
                                              ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                              : responseReceived === "No"
                                              ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                              : "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                                          }`}>
                                            {responseReceived}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Decision Received Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                          <div>Decision</div>
                                          <div>Received</div>
                                        </div>
                                        <div className="h-6 flex items-center">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <span className={`font-medium text-xs px-2 py-1 rounded-full border cursor-pointer ${
                                                getCampaignDecision(person.id) === "Yes" 
                                                  ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                                  : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                              }`}>
                                                {getCampaignDecision(person.id)}
                                              </span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-32 p-1">
                                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                                                Select Decision
                                              </div>
                                              <DropdownMenuItem 
                                                onClick={() => setCampaignDecision(person.id, "Yes")}
                                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                                    Yes
                                                  </div>
                                                </div>
                                                {getCampaignDecision(person.id) === "Yes" && <Check className="h-3 w-3 text-green-700 dark:text-green-300" />}
                                              </DropdownMenuItem>
                                              <div className="h-px bg-border my-1"></div>
                                              <DropdownMenuItem 
                                                onClick={() => setCampaignDecision(person.id, "No")}
                                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                                                    No
                                                  </div>
                                                </div>
                                                {getCampaignDecision(person.id) === "No" && <Check className="h-3 w-3 text-red-700 dark:text-red-300" />}
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                      
                                      {/* Status Column */}
                                      <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="text-xs text-muted-foreground whitespace-nowrap mb-1">Status</div>
                                        <div className="h-6 flex items-center">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <span className={`font-medium text-xs px-2 py-1 rounded-full border cursor-pointer ${
                                                getCampaignStatus(person.id) === "Archive" 
                                                  ? "text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600" 
                                                  : "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                                              }`}>
                                                {getCampaignStatus(person.id)}
                                              </span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-32 p-1">
                                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                                                Select Status
                                              </div>
                                              <DropdownMenuItem 
                                                onClick={() => setCampaignStatus(person.id, "Active")}
                                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                                    Active
                                                  </div>
                                                </div>
                                                {getCampaignStatus(person.id) === "Active" && <Check className="h-3 w-3 text-green-700 dark:text-green-300" />}
                                              </DropdownMenuItem>
                                              <div className="h-px bg-border my-1"></div>
                                              <DropdownMenuItem 
                                                onClick={() => setCampaignStatus(person.id, "Archive")}
                                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                                                    Archive
                                                  </div>
                                                </div>
                                                {getCampaignStatus(person.id) === "Archive" && <Check className="h-3 w-3 text-gray-700 dark:text-gray-100" />}
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center py-1.5">
                <CardTitle>Campaign Statistics</CardTitle>
                <div></div>
              </div>
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Analytics Available</h3>
                  <p className="text-muted-foreground">Add people to view campaign statistics and track performance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {people.map((person) => {
                    const isExpanded = expandedPersons[person.id] || false;
                    
                    // Mock attempt data for each person
                    // Calculate total email and resume views from attempts
                    const attempts = [
                      {
                        attemptNumber: 1,
                        sentDate: "23/07/24",
                        emailOpened: "5/5",
                        resumeOpened: "3/5",
                        response: "Yes",
                        decision: "No",
                        emailViews: 5,
                        resumeViews: 3,
                        sentStatus: "Sent"
                      },
                      {
                        attemptNumber: 2,
                        sentDate: "30/07/24",
                        emailOpened: "4/5",
                        resumeOpened: "2/5",
                        response: "No",
                        decision: "No",
                        emailViews: 4,
                        resumeViews: 2,
                        sentStatus: "Sent"
                      },
                      {
                        attemptNumber: 3,
                        sentDate: "06/08/24",
                        emailOpened: "3/5",
                        resumeOpened: "1/5",
                        response: "Not Yet",
                        decision: "No",
                        emailViews: 3,
                        resumeViews: 1,
                        sentStatus: "Sent"
                      }
                    ];
                    
                    const totalEmailViews = attempts.reduce((sum, attempt) => sum + attempt.emailViews, 0);
                    const totalResumeViews = attempts.reduce((sum, attempt) => sum + attempt.resumeViews, 0);
                    
                    return (
                      <Card key={person.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="px-3 py-3 lg:px-6 lg:py-4 bg-card">
                            <div className="flex gap-2 items-center text-xs lg:text-sm">
                              {/* Person Column */}
                              <div className="flex-[2] px-2 flex items-center justify-start h-full">
                                <div className="flex items-center gap-3">
                                  {/* Person Avatar */}
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                      {person.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="font-semibold text-foreground truncate">
                                      {person.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{person.email}</div>
                                    <div className="text-xs text-muted-foreground truncate">{person.position || "-"}</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Current Campaign Column */}
                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                  <div>Current</div>
                                  <div>Campaign</div>
                                </div>
                                <div className="font-medium text-center h-6 flex items-center justify-center">
                                  <CircularProgressBlue 
                                    value={Math.floor(Math.random() * 3) + 1} 
                                    total={3} 
                                    size="sm"
                                    showFraction={true}
                                    showPercentage={false}
                                  />
                                </div>
                              </div>
                              
                              {/* Total Email Views Column */}
                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                  <div>Total Email</div>
                                  <div>Views</div>
                                </div>
                                <div className="font-medium text-center h-6 flex items-center justify-center">
                                  <span className={`font-medium text-sm ${
                                    totalEmailViews === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                  }`}>
                                    {totalEmailViews}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Total Resume Views Column */}
                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                  <div>Total Resume</div>
                                  <div>Views</div>
                                </div>
                                <div className="font-medium text-center h-6 flex items-center justify-center">
                                  <span className={`font-medium text-sm ${
                                    totalResumeViews === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                  }`}>
                                    {totalResumeViews}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Response Received Column */}
                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                  <div>Response</div>
                                  <div>Received</div>
                                </div>
                                <div className="font-medium text-center h-6 flex items-center justify-center">
                                  {(() => {
                                    const responses = ["Yes", "No", "Not Yet"];
                                    const response = responses[Math.floor(Math.random() * responses.length)];
                                    return (
                                      <span className={`font-medium text-xs px-2 py-1 rounded-full border ${
                                        response === "Yes" 
                                          ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                          : response === "No"
                                          ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                          : "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                                      }`}>
                                        {response}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                              
                              {/* Decision Received Column */}
                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                  <div>Decision</div>
                                  <div>Received</div>
                                </div>
                                <div className="font-medium text-center h-6 flex items-center justify-center">
                                  {(() => {
                                    const decisions = ["Yes", "No"];
                                    const decision = decisions[Math.floor(Math.random() * decisions.length)];
                                    return (
                                      <span className={`font-medium text-xs px-2 py-1 rounded-full border ${
                                        decision === "Yes" 
                                          ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                          : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                      }`}>
                                        {decision === "Yes" ? "Yes" : "No"}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                              
                              {/* Details Column */}
                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                                  <div>Details</div>
                                </div>
                                <div className="h-6 flex items-center justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePersonExpansion(person.id)}
                                    className="h-5 w-5 lg:h-8 lg:w-8 p-0"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          <Collapsible open={isExpanded}>
                            <CollapsibleContent>
                              <div className="border-t bg-gray-100 dark:bg-gray-800">
                                {attempts.length === 0 ? (
                                  <div className="px-3 py-1.5 lg:px-6 lg:py-1.5">
                                    <p className="text-sm text-muted-foreground">No previous attempts recorded</p>
                                  </div>
                                ) : (
                                  <div className="space-y-0">
                                    {/* Header Row */}
                                    <div className="px-3 lg:px-6 border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
                                      <div className="grid grid-cols-7 gap-2 items-center text-xs font-medium py-2 text-muted-foreground">
                                        {/* Reach Attempt Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Reach</div>
                                            <div>Attempt</div>
                                          </div>
                                        </div>
                                        
                                        {/* Scheduled Date Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Scheduled</div>
                                            <div>Date</div>
                                          </div>
                                        </div>
                                        
                                        {/* Sent Status Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Sent</div>
                                            <div>Status</div>
                                          </div>
                                        </div>
                                        
                                        {/* Email Views Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Email</div>
                                            <div>Views</div>
                                          </div>
                                        </div>
                                        
                                        {/* Resume Views Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Resume</div>
                                            <div>Views</div>
                                          </div>
                                        </div>
                                        
                                        {/* Response Received Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Response</div>
                                            <div>Received</div>
                                          </div>
                                        </div>
                                        
                                        {/* Decision Received Column Header */}
                                        <div className="flex flex-col items-center px-2">
                                          <div className="text-center whitespace-nowrap">
                                            <div>Decision</div>
                                            <div>Received</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {attempts.map((attempt, index) => (
                                      <div key={attempt.attemptNumber}>
                                        {index > 0 && <div className="h-px bg-gray-300 dark:bg-gray-600"></div>}
                                        <div className="px-3 lg:px-6">
                                          <div className="grid grid-cols-7 gap-2 items-center text-xs lg:text-sm py-2">
                                            {/* Reach Attempt Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="font-medium text-center h-6 flex items-center justify-center">
                                                <CircularProgressBlue 
                                                  value={attempt.attemptNumber} 
                                                  total={3} 
                                                  size="sm"
                                                  showFraction={true}
                                                  showPercentage={false}
                                                />
                                              </div>
                                            </div>
                                            
                                            {/* Scheduled Date Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="font-medium text-center h-6 flex items-center text-xs whitespace-nowrap">{attempt.sentDate}</div>
                                            </div>
                                            
                                            {/* Sent Status Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="h-6 flex items-center">
                                                <span className="font-medium text-xs px-2 py-1 rounded-full border text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                                                  {attempt.sentStatus}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Email Views Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="font-medium text-center h-6 flex items-center justify-center">
                                                <span className={`font-medium text-sm ${
                                                  attempt.emailViews === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                                }`}>
                                                  {attempt.emailViews}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Resume Views Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="font-medium text-center h-6 flex items-center justify-center">
                                                <span className={`font-medium text-sm ${
                                                  attempt.resumeViews === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                                }`}>
                                                  {attempt.resumeViews}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Response Received Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="h-6 flex items-center">
                                                <span className={`font-medium text-xs px-2 py-1 rounded-full border ${
                                                  attempt.response === "Yes" 
                                                    ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                                    : attempt.response === "No"
                                                    ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                                    : "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                                                }`}>
                                                  {attempt.response}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            {/* Decision Received Column */}
                                            <div className="flex flex-col items-center px-2">
                                              <div className="h-6 flex items-center">
                                                <span className={`font-medium text-xs px-2 py-1 rounded-full border ${
                                                  attempt.decision === "Yes" 
                                                    ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                                    : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                                }`}>
                                                  {attempt.decision === "Yes" ? "Yes" : "No"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Views Modal */}
      <Dialog open={emailViewsModal.isOpen} onOpenChange={(open) => setEmailViewsModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="whitespace-nowrap">
              Email Views - {emailViewsModal.personName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-08-09 10:30:15</TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</TableCell>
                    <TableCell>New York, NY</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-08-09 14:22:45</TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)</TableCell>
                    <TableCell>New York, NY</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-08-10 09:15:30</TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</TableCell>
                    <TableCell>New York, NY</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Views Modal */}
      <Dialog open={resumeViewsModal.isOpen} onOpenChange={(open) => setResumeViewsModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="whitespace-nowrap">
              Resume Views - {resumeViewsModal.personName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-08-09 10:32:20</TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</TableCell>
                    <TableCell>New York, NY</TableCell>
                    <TableCell>2m 45s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-08-10 09:18:15</TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</TableCell>
                    <TableCell>New York, NY</TableCell>
                    <TableCell>1m 30s</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Modal */}
      <Dialog open={responseModal.isOpen} onOpenChange={(open) => setResponseModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="whitespace-nowrap">
              Response Status - {responseModal.personName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4">
              {responseModal.response === "No" && (
                <div className="text-center">
                  <div className="text-lg font-medium text-red-600 mb-2">No Response Received Yet</div>
                  <p className="text-muted-foreground">This contact has not responded to our outreach emails.</p>
                </div>
              )}
              {responseModal.response === "Not Yet" && (
                <div className="text-center">
                  <div className="text-lg font-medium text-yellow-600 mb-2">Campaign Still Active</div>
                  <p className="text-muted-foreground">Waiting for a response. Campaign is actively running.</p>
                </div>
              )}
              {responseModal.response === "Yes" && (
                <div className="text-center">
                  <div className="text-lg font-medium text-green-600 mb-4">Response Received!</div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-w-2xl mx-auto">
                    <div className="text-sm font-medium mb-2">Response Details:</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>Date:</strong> August 9, 2024 at 2:30 PM
                    </div>
                    <div className="text-sm text-left">
                      <strong>Message:</strong><br />
                      "Thank you for reaching out. I'm interested in learning more about this opportunity. Could we schedule a call to discuss further?"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Company Confirmation Modals */}
      {/* First confirmation - Are you sure? */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center space-y-2 pb-3">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-center">
              Delete Company
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{company?.name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setShowDeleteModal(false);
                setShowDeleteConfirm(true);
                setDeleteConfirmText("");
              }}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Second confirmation - Type company name */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center space-y-2 pb-3">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-center">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              To confirm deletion, please type the company name below:
            </p>
            <div className="text-center">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                {company?.name}
              </code>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-sm font-medium">
                Company Name
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Type "${company?.name}" to confirm`}
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText("");
              }}
              disabled={deleteCompanyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteConfirmText === company?.name) {
                  deleteCompanyMutation.mutate();
                }
              }}
              disabled={deleteConfirmText !== company?.name || deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? "Deleting..." : "Delete Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog 
        open={showEditModal} 
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) {
            // Reset form data when modal closes
            setEditCompanyData({
              name: company?.name || "",
              website: company?.website || "",
              linkedin: company?.linkedin || "",
              crunchbase: company?.crunchbase || "",
              companySize: company?.companySize || ""
            });
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center space-y-2 pb-3">
            <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <DialogTitle className="text-lg font-semibold text-center">
              Edit Company
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="edit-company-name" className="text-sm font-medium flex items-center gap-2">
                Company Name
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              </Label>
              <Input
                id="edit-company-name"
                value={editCompanyData.name}
                onChange={(e) => setEditCompanyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Acme Corp"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-company-size" className="text-sm font-medium flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-gray-600" />
                Company Size
              </Label>
              <Select 
                value={editCompanyData.companySize} 
                onValueChange={(value) => setEditCompanyData(prev => ({ ...prev, companySize: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="edit-website" className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Website URL
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              </Label>
              <Input
                id="edit-website"
                value={editCompanyData.website}
                onChange={(e) => setEditCompanyData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="e.g., acme.com"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-linkedin" className="text-sm font-medium flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                LinkedIn URL
              </Label>
              <Input
                id="edit-linkedin"
                value={editCompanyData.linkedin}
                onChange={(e) => setEditCompanyData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/company/acme"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-crunchbase" className="text-sm font-medium flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="6" fill="#0066CC"/>
                  <text x="12" y="16" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">cb</text>
                </svg>
                Crunchbase URL
              </Label>
              <Input
                id="edit-crunchbase"
                value={editCompanyData.crunchbase}
                onChange={(e) => setEditCompanyData(prev => ({ ...prev, crunchbase: e.target.value }))}
                placeholder="https://crunchbase.com/organization/acme"
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                // Reset form data to original values
                setEditCompanyData({
                  name: company?.name || "",
                  website: company?.website || "",
                  linkedin: company?.linkedin || "",
                  crunchbase: company?.crunchbase || "",
                  companySize: company?.companySize || ""
                });
              }}
              disabled={editCompanyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!editCompanyData.name || !editCompanyData.website) {
                  toast({
                    title: "Validation Error",
                    description: "Company name and website are required",
                    variant: "destructive",
                  });
                  return;
                }

                editCompanyMutation.mutate({
                  name: editCompanyData.name,
                  website: editCompanyData.website,
                  linkedin: editCompanyData.linkedin,
                  crunchbase: editCompanyData.crunchbase,
                  companySize: editCompanyData.companySize,
                });
              }}
              disabled={editCompanyMutation.isPending}
            >
              {editCompanyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Big Calendar Modal */}
      <Dialog 
        open={calendarModal.isOpen} 
        onOpenChange={(open) => setCalendarModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Schedule {calendarModal.emailType === 'firstEmail' ? 'First' : calendarModal.emailType === 'secondEmail' ? 'Second' : 'Third'} Email - {calendarModal.personName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-1 min-h-0">
            {/* Calendar Section */}
            <div className="flex-1 p-6 flex flex-col">
              {/* Custom Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(calendarModal.viewingDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCalendarModal(prev => ({ ...prev, viewingDate: newDate }));
                  }}
                  className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center gap-3">
                  {/* Month Dropdown */}
                  <Select
                    value={calendarModal.viewingDate.getMonth().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(calendarModal.viewingDate);
                      newDate.setMonth(parseInt(value));
                      setCalendarModal(prev => ({ ...prev, viewingDate: newDate }));
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Year Dropdown */}
                  <Select
                    value={calendarModal.viewingDate.getFullYear().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(calendarModal.viewingDate);
                      newDate.setFullYear(parseInt(value));
                      setCalendarModal(prev => ({ ...prev, viewingDate: newDate }));
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const currentYear = new Date().getFullYear();
                        const years = [];
                        // Go back 50 years and forward 50 years from current year
                        for (let year = currentYear - 50; year <= currentYear + 50; year++) {
                          years.push(year);
                        }
                        return years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(calendarModal.viewingDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCalendarModal(prev => ({ ...prev, viewingDate: newDate }));
                  }}
                  className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Custom Calendar Grid */}
              <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg border shadow-sm overflow-hidden flex flex-col">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-4 text-center font-semibold text-sm text-gray-600 dark:text-gray-400 border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid - This should fill remaining space */}
                <div className="grid grid-cols-7 grid-rows-6 flex-1 h-full">
                  {(() => {
                    const year = calendarModal.viewingDate.getFullYear();
                    const month = calendarModal.viewingDate.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startingDayOfWeek = firstDay.getDay();
                    
                    const days = [];
                    
                    // Previous month's trailing days
                    const prevMonth = new Date(year, month - 1, 0);
                    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                      const day = prevMonth.getDate() - i;
                      const date = new Date(year, month - 1, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const cellIndex = startingDayOfWeek - 1 - i;
                      const isLastRow = cellIndex >= 35; // Last row starts at index 35
                      days.push(
                        <button
                          key={`prev-${day}`}
                          className={`w-full h-full border-r ${!isLastRow ? 'border-b' : ''} last:border-r-0 p-2 transition-colors flex items-center justify-center text-sm cursor-not-allowed opacity-60 ${
                            isWeekend 
                              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-50 dark:bg-gray-950/30 text-gray-400 dark:text-gray-600'
                          }`}
                          disabled
                        >
                          {day}
                        </button>
                      );
                    }
                    
                    // Current month's days
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
                      const isToday = today.getTime() === date.getTime();
                      const isPastDate = date.getTime() < today.getTime();
                      // Only show as selected if this date matches the selected date AND we're viewing the same month
                      const isSelected = calendarModal.currentDate.getFullYear() === year && 
                                       calendarModal.currentDate.getMonth() === month && 
                                       calendarModal.currentDate.getDate() === day;
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isDisabled = isWeekend || isPastDate;
                      const cellIndex = startingDayOfWeek + day - 1;
                      const isLastRow = cellIndex >= 35; // Last row starts at index 35
                      
                      days.push(
                        <button
                          key={day}
                          onClick={() => {
                            if (!isDisabled) {
                              setCalendarModal(prev => ({ ...prev, currentDate: date }));
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-full h-full border-r ${!isLastRow ? 'border-b' : ''} last:border-r-0 p-2 transition-colors duration-200 flex items-center justify-center text-sm font-medium ${
                            isSelected
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : isToday
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold border-2 border-blue-500'
                              : isDisabled
                              ? (isWeekend 
                                 ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 cursor-not-allowed opacity-60'
                                 : 'bg-gray-50 dark:bg-gray-950/30 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60')
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    }
                    
                    // Next month's leading days to fill the grid (always show exactly 42 days = 6 rows)
                    const totalCells = 42;
                    const remainingCells = totalCells - days.length;
                    for (let day = 1; day <= remainingCells; day++) {
                      const date = new Date(year, month + 1, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const cellIndex = days.length;
                      const isLastRow = cellIndex >= 35; // Last row starts at index 35
                      days.push(
                        <button
                          key={`next-${day}`}
                          className={`w-full h-full border-r ${!isLastRow ? 'border-b' : ''} last:border-r-0 p-2 transition-colors flex items-center justify-center text-sm cursor-not-allowed opacity-60 ${
                            isWeekend 
                              ? 'bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-gray-600'
                              : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
                          }`}
                          disabled
                        >
                          {day}
                        </button>
                      );
                    }
                    
                    return days;
                  })()}
                </div>
              </div>
            </div>
            
            {/* Events Sidebar */}
            <div className="w-80 border bg-gray-50 dark:bg-gray-900/50 flex flex-col rounded-l-lg pt-6 pb-6">
              <div className="px-4 pb-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg">Events</h3>
                <p className="text-sm text-muted-foreground">
                  {format(calendarModal.viewingDate, 'MMMM yyyy')}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Details Section */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      Details
                    </h4>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                      {(() => {
                        const currentPerson = people.find(p => p.id === calendarModal.personId);
                        const currentEmailType = calendarModal.emailType;
                        const currentCampaignIndex = activeCampaign;
                        
                        // Get previous campaign schedules for this person
                        const getPreviousSchedules = () => {
                          const schedules = [];
                          const personSchedules = scheduledDates[calendarModal.personId];
                          
                          if (!personSchedules) return [];
                          
                          if (currentEmailType === 'secondEmail' || currentEmailType === 'thirdEmail') {
                            if (personSchedules.firstEmail) {
                              schedules.push(`First Email: ${personSchedules.firstEmail}`);
                            }
                          }
                          
                          if (currentEmailType === 'thirdEmail') {
                            if (personSchedules.secondEmail) {
                              schedules.push(`Second Email: ${personSchedules.secondEmail}`);
                            }
                          }
                          
                          return schedules;
                        };

                        return (
                          <>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Person</div>
                              <div className="text-sm font-medium">
                                {currentPerson ? currentPerson.name : "Unknown"}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Location</div>
                              <div className="text-sm">
                                {currentPerson && currentPerson.city && currentPerson.country 
                                  ? `${currentPerson.city}, ${currentPerson.country}`
                                  : "Location not specified"
                                }
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Previous Campaign Schedules</div>
                              <div className="text-sm">
                                {(() => {
                                  const previousSchedules = getPreviousSchedules();
                                  if (previousSchedules.length === 0) {
                                    return currentEmailType === 'firstEmail' 
                                      ? "None (First campaign email)" 
                                      : "No previous schedules found";
                                  }
                                  return (
                                    <div className="space-y-1">
                                      {previousSchedules.map((schedule, index) => (
                                        <div key={index} className="text-xs bg-primary/10 border border-primary/20 p-2 rounded">
                                          {schedule}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Selected Date Info */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      Selected Date
                    </h4>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="font-medium">
                        {format(calendarModal.currentDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getEventsForDate(calendarModal.currentDate).length > 0 ? (
                          getEventsForDate(calendarModal.currentDate).map((event, index) => (
                            <span key={index} className={event.color}>
                              {event.title}
                            </span>
                          ))
                        ) : (
                          "Regular business day"
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      Holidays & Weekends
                    </h4>
                    <div className="space-y-2">
                      {getMonthEvents(calendarModal.viewingDate).map((event, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(calendarModal.viewingDate.getFullYear(), calendarModal.viewingDate.getMonth(), event.date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="space-y-1">
                      <div><strong>•</strong> Weekends are marked as holidays. Consider scheduling emails for business days for better engagement.</div>
                      <div><strong>•</strong> Holidays are marked as per person's location: {(() => {
                        const currentPerson = people.find(p => p.id === calendarModal.personId);
                        return currentPerson && currentPerson.country 
                          ? currentPerson.country 
                          : "Country not specified";
                      })()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
            <Button 
              onClick={() => setShowUpdateConfirm(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Update Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Schedule Confirmation Dialog */}
      <AlertDialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Schedule Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the schedule to <strong>{format(calendarModal.currentDate, 'EEEE, MMMM d, yyyy')}</strong>? This will change the scheduled date for this email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                updateScheduledDate(calendarModal.currentDate);
                setShowUpdateConfirm(false);
              }}
            >
              Yes, Update Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
