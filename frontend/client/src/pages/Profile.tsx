import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Bell, Shield, Download, Trash2, Camera, Upload, X, Mountain, Mail, FileText, PlusCircle, Database, Edit2, MoreVertical, MessageCircle, Send, Hash, AtSign, MessageSquare, AlertTriangle, Check, CheckCircle2, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { profileApi } from "@/lib/profileApi";
import type { Profile, ClientConnections, NotificationSettings, EmailData } from "@/lib/profileApi";

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
);

// Custom Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Custom Discord Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
  </svg>
);

// Custom X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

// Custom Signal Icon Component
const SignalIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 512 512"
    className={className}
    fill="currentColor"
  >
    <rect x="64" y="64" width="384" height="384" rx="64" ry="64" />
    <g fill="#fff">
      <circle cx="256" cy="256" r="120" />
    </g>
    <path
      d="
        M 200,240
        h 224
        v 48
        h -224
        z
      "
      fill="currentColor"
    />
  </svg>
);

// Custom Mountains Icon Component using simple Mountain icon
const MountainsIcon = ({ className }: { className?: string }) => (
  <Mountain className={className} />
);

export default function Profile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Backend data state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clientConnections, setClientConnections] = useState<ClientConnections | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem('profileImage') || null;
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoDialogTab, setPhotoDialogTab] = useState<"preview" | "upload">("preview");

  // Personal Data state
  const [activeTab, setActiveTab] = useState<string>("email");
  const [selectedEmailCategory, setSelectedEmailCategory] = useState<string>("");
  const [selectedResumeCategory, setSelectedResumeCategory] = useState<string>("");
  const [selectedCoverLetterCategory, setSelectedCoverLetterCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<{ [key: string]: boolean }>({
    email: false,
    resume: false,
    coverLetter: false
  });
  const [editingCategory, setEditingCategory] = useState<{ type: string; oldName: string } | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: string; categoryName: string } | null>(null);

  // State for notification client selection
  const [selectedNotificationClient, setSelectedNotificationClient] = useState<string>('WhatsApp');
  
  // Email modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentEmailContent, setCurrentEmailContent] = useState("");
  const [editingEmailContent, setEditingEmailContent] = useState("");
  const [currentEmailTitle, setCurrentEmailTitle] = useState("");
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for confirmation dialog
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    client: string;
    setting: 'emailViews' | 'resumeViews' | 'responses';
    value: boolean;
    settingLabel: string;
  }>({
    isOpen: false,
    client: '',
    setting: 'emailViews',
    value: false,
    settingLabel: ''
  });

  // Load data from backend on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Load all profile data in parallel
        const [profileData, connectionsData, settingsData, emailTemplateData] = await Promise.all([
          profileApi.getProfile(),
          profileApi.getClientConnections(),
          profileApi.getNotificationSettings(),
          profileApi.getEmailData()
        ]);

        setProfile(profileData);
        setClientConnections(connectionsData);
        setNotificationSettings(settingsData);
        setEmailData(emailTemplateData);
        
        // Sync profile image with localStorage
        if (profileData.profileImage) {
          setProfileImage(profileData.profileImage);
          localStorage.setItem('profileImage', profileData.profileImage);
        }
        
      } catch (error) {
        console.error('Failed to load profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [toast]);

  // Helper functions to get data with fallbacks
  const getEmailCategories = () => profile?.emailCategories || ["Cold Outreach", "Follow-up", "Networking", "Application"];
  const getResumeCategories = () => profile?.resumeCategories || ["Tech Resume", "Executive Resume", "Creative Resume"];
  const getCoverLetterCategories = () => profile?.coverLetterCategories || ["Tech Cover Letter", "Executive Cover Letter", "Creative Cover Letter"];
  const getClientConnectionStatus = (client: string) => {
    if (!clientConnections) return false;
    return (clientConnections as any)[client] || false;
  };
  const getNotificationSettingsForClient = (client: string) => {
    if (!notificationSettings) return { emailViews: true, resumeViews: true, responses: false };
    return (notificationSettings as any)[client] || { emailViews: true, resumeViews: true, responses: false };
  };
  const getEmailTemplatesForCategory = (category: string) => {
    if (!emailData) return [];
    return (emailData as any)[category] || [];
  };

  const mockResumeData = {
    "Tech Resume": "https://drive.google.com/file/d/tech-resume-2024",
    "Executive Resume": "https://dropbox.com/files/executive-resume-v2",
    "Creative Resume": "https://onedrive.com/creative-portfolio-resume"
  };

  const mockCoverLetterData = {
    "Tech Cover Letter": "https://drive.google.com/file/d/tech-cover-letter-template",
    "Executive Cover Letter": "https://dropbox.com/files/executive-cover-letter",
    "Creative Cover Letter": "https://onedrive.com/creative-cover-letter-2024"
  };

  const handleFileUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageUrl = e.target?.result as string;
          
          // Update backend
          await profileApi.updateProfile({ profileImage: imageUrl });
          
          // Update local state
          setProfileImage(imageUrl);
          localStorage.setItem('profileImage', imageUrl);
          
          // Update profile state
          if (profile) {
            setProfile({ ...profile, profileImage: imageUrl });
          }
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('profileImageChanged', { detail: imageUrl }));
          setShowUploadModal(false);
          
          toast({
            title: "Profile Photo Updated",
            description: "Your profile photo has been uploaded successfully.",
            className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
          });
        } catch (error) {
          console.error('Failed to update profile image:', error);
          toast({
            title: "Error",
            description: "Failed to update profile photo. Please try again.",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoClick = () => {
    setPhotoDialogTab("preview");
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
      className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export has been initiated. You'll receive an email when it's ready.",
      className: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 dark:border-blue-400",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  // Category management functions
  const handleEditCategory = (type: string, oldName: string) => {
    setEditingCategory({ type, oldName });
    setEditCategoryName(oldName);
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim() || !profile) return;

    const { type, oldName } = editingCategory;
    const newName = editCategoryName.trim();

    try {
      let updateData: any = {};
      
      if (type === 'email') {
        const updatedCategories = profile.emailCategories.map(cat => cat === oldName ? newName : cat);
        updateData.emailCategories = updatedCategories;
        if (selectedEmailCategory === oldName) {
          setSelectedEmailCategory(newName);
        }
      } else if (type === 'resume') {
        const updatedCategories = profile.resumeCategories.map(cat => cat === oldName ? newName : cat);
        updateData.resumeCategories = updatedCategories;
        if (selectedResumeCategory === oldName) {
          setSelectedResumeCategory(newName);
        }
      } else if (type === 'coverLetter') {
        const updatedCategories = profile.coverLetterCategories.map(cat => cat === oldName ? newName : cat);
        updateData.coverLetterCategories = updatedCategories;
        if (selectedCoverLetterCategory === oldName) {
          setSelectedCoverLetterCategory(newName);
        }
      }

      // Update backend
      const updatedProfile = await profileApi.updateProfile(updateData);
      setProfile(updatedProfile);

      setEditingCategory(null);
      setEditCategoryName("");
      toast({
        title: "Category Updated",
        description: `Category renamed from "${oldName}" to "${newName}".`,
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = (type: string, categoryName: string) => {
    setDeleteConfirmation({ type, categoryName });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmation || !profile) return;

    const { type, categoryName } = deleteConfirmation;

    try {
      let updateData: any = {};
      
      if (type === 'email') {
        const updatedCategories = profile.emailCategories.filter(cat => cat !== categoryName);
        updateData.emailCategories = updatedCategories;
        if (selectedEmailCategory === categoryName) {
          setSelectedEmailCategory("");
        }
      } else if (type === 'resume') {
        const updatedCategories = profile.resumeCategories.filter(cat => cat !== categoryName);
        updateData.resumeCategories = updatedCategories;
        if (selectedResumeCategory === categoryName) {
          setSelectedResumeCategory("");
        }
      } else if (type === 'coverLetter') {
        const updatedCategories = profile.coverLetterCategories.filter(cat => cat !== categoryName);
        updateData.coverLetterCategories = updatedCategories;
        if (selectedCoverLetterCategory === categoryName) {
          setSelectedCoverLetterCategory("");
        }
      }

      // Update backend
      const updatedProfile = await profileApi.updateProfile(updateData);
      setProfile(updatedProfile);

      setDeleteConfirmation(null);
      toast({
        title: "Category Deleted",
        description: `Category "${categoryName}" has been deleted.`,
        className: "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 dark:border-red-400",
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async (type: string) => {
    if (!newCategoryName.trim() || !profile) return;

    const categoryName = newCategoryName.trim();
    
    try {
      let updateData: any = {};
      let categories: string[] = [];
      
      if (type === 'email') {
        categories = profile.emailCategories;
        if (!categories.includes(categoryName)) {
          updateData.emailCategories = [...categories, categoryName];
          setSelectedEmailCategory(categoryName);
        } else {
          toast({
            title: "Category Exists",
            description: "This category already exists.",
            variant: "destructive",
          });
          return;
        }
      } else if (type === 'resume') {
        categories = profile.resumeCategories;
        if (!categories.includes(categoryName)) {
          updateData.resumeCategories = [...categories, categoryName];
          setSelectedResumeCategory(categoryName);
        } else {
          toast({
            title: "Category Exists",
            description: "This category already exists.",
            variant: "destructive",
          });
          return;
        }
      } else if (type === 'coverLetter') {
        categories = profile.coverLetterCategories;
        if (!categories.includes(categoryName)) {
          updateData.coverLetterCategories = [...categories, categoryName];
          setSelectedCoverLetterCategory(categoryName);
        } else {
          toast({
            title: "Category Exists",
            description: "This category already exists.",
            variant: "destructive",
          });
          return;
        }
      }

      // Update backend
      const updatedProfile = await profileApi.updateProfile(updateData);
      setProfile(updatedProfile);

      setShowNewCategoryInput(prev => ({ ...prev, [type]: false }));
      setNewCategoryName("");
      
      toast({
        title: "Category Added",
        description: `Category "${categoryName}" has been added.`,
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
    } catch (error) {
      console.error('Failed to add category:', error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle notification setting changes
  const handleNotificationToggle = (client: string, setting: 'emailViews' | 'resumeViews' | 'responses', value: boolean) => {
    const settingLabels = {
      emailViews: 'Email Views',
      resumeViews: 'Resume Views', 
      responses: 'Responses'
    };
    
    // Check if client is connected
    const isClientConnected = getClientConnectionStatus(client);
    
    if (isClientConnected) {
      // Show confirmation dialog for connected clients
      setConfirmationDialog({
        isOpen: true,
        client,
        setting,
        value,
        settingLabel: settingLabels[setting]
      });
    } else {
      // Directly update settings for disconnected clients
      updateNotificationSettingInBackend(client, setting, value);
    }
  };

  // Function to update notification setting in backend
  const updateNotificationSettingInBackend = async (client: string, setting: 'emailViews' | 'resumeViews' | 'responses', value: boolean) => {
    if (!notificationSettings) return;

    try {
      const currentClientSettings = getNotificationSettingsForClient(client);
      const updateData = {
        [client]: {
          emailViews: currentClientSettings.emailViews,
          resumeViews: currentClientSettings.resumeViews,
          responses: currentClientSettings.responses,
          [setting]: value
        }
      };

      const updatedSettings = await profileApi.updateNotificationSettings(updateData);
      setNotificationSettings(updatedSettings);

      toast({
        title: "Settings Updated",
        description: `Notification settings for ${client} have been updated.`,
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to confirm notification setting change
  const confirmNotificationToggle = () => {
    const { client, setting, value } = confirmationDialog;
    updateNotificationSettingInBackend(client, setting, value);
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Function to handle client connection
  const handleClientConnect = async (client: string) => {
    if (!clientConnections) return;

    try {
      const updateData = { [client]: true };
      const updatedConnections = await profileApi.updateClientConnections(updateData);
      setClientConnections(updatedConnections);

      toast({
        title: "Client Connected",
        description: `${client} has been connected successfully.`,
        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
      });
    } catch (error) {
      console.error('Failed to update client connection:', error);
      toast({
        title: "Error",
        description: "Failed to update client connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle client disconnection
  const handleClientDisconnect = async (client: string) => {
    if (!clientConnections) return;

    try {
      const updateData = { [client]: false };
      const updatedConnections = await profileApi.updateClientConnections(updateData);
      setClientConnections(updatedConnections);

      toast({
        title: "Client Disconnected",
        description: `${client} has been disconnected.`,
        className: "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 dark:border-red-400",
      });
    } catch (error) {
      console.error('Failed to update client connection:', error);
      toast({
        title: "Error",
        description: "Failed to update client connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center mb-6">
            <div 
              className="relative w-20 h-20 rounded-full cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-opacity-30"
              onClick={handlePhotoClick}
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary-foreground">AJ</span>
                </div>
              )}
              {/* Upload overlay */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                defaultValue="Alex Johnson" 
                data-testid="input-full-name"
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input 
                id="position" 
                defaultValue="Senior Recruiter" 
                data-testid="input-position"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="alex.johnson@mountains.com" 
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                defaultValue="+1 (555) 123-4567" 
                data-testid="input-phone"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                defaultValue="Mountains" 
                data-testid="input-company"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                defaultValue="San Francisco, CA" 
                data-testid="input-location"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleUpdateProfile} 
              className="px-6"
              data-testid="button-update-profile"
            >
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Personal Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="coverLetter" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Cover Letter
              </TabsTrigger>
            </TabsList>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  {!showNewCategoryInput.email ? (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="email-category">Email Category</Label>
                        <Select 
                          value={selectedEmailCategory} 
                          onValueChange={(value) => {
                            if (value === "__new_category__") {
                              setShowNewCategoryInput(prev => ({ ...prev, email: true }));
                            } else {
                              setSelectedEmailCategory(value);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getEmailCategories().map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{category}</span>
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="__new_category__">
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <PlusCircle className="w-4 h-4" />
                                <span>New Category</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedEmailCategory && selectedEmailCategory !== "__new_category__" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditCategory('email', selectedEmailCategory)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory('email', selectedEmailCategory)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="new-email-category">New Category Name</Label>
                        <Input
                          id="new-email-category"
                          placeholder="Enter new category name..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => handleAddCategory('email')} size="sm">
                        Add
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowNewCategoryInput(prev => ({ ...prev, email: false }));
                          setNewCategoryName("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>

                {editingCategory?.type === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-email-category">Edit Category Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-email-category"
                        placeholder="Enter category name..."
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                      <Button onClick={handleSaveEditCategory} size="sm">
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {selectedEmailCategory && !showNewCategoryInput.email && !editingCategory && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {/* First Email */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">First Mail - Initial Outreach</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                              setCurrentEmailContent(getEmailTemplatesForCategory(selectedEmailCategory)?.[0] || "");
                              setEditingEmailContent(getEmailTemplatesForCategory(selectedEmailCategory)?.[0] || "");
                              setCurrentEmailTitle("First Mail - Initial Outreach");
                              setCurrentEmailIndex(0);
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
                            value={getEmailTemplatesForCategory(selectedEmailCategory)?.[0] || ""}
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
                          <h4 className="text-sm font-medium">Second Mail - Follow-up</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                              setCurrentEmailContent(getEmailTemplatesForCategory(selectedEmailCategory)?.[1] || "");
                              setEditingEmailContent(getEmailTemplatesForCategory(selectedEmailCategory)?.[1] || "");
                              setCurrentEmailTitle("Second Mail - Follow-up");
                              setCurrentEmailIndex(1);
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
                            value={getEmailTemplatesForCategory(selectedEmailCategory)?.[1] || ""}
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
                          <h4 className="text-sm font-medium">Third Mail - Final Follow-up</h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                              setCurrentEmailContent(getEmailTemplatesForCategory(selectedEmailCategory)?.[2] || "");
                              setEditingEmailContent(getEmailTemplatesForCategory(selectedEmailCategory)?.[2] || "");
                              setCurrentEmailTitle("Third Mail - Final Follow-up");
                              setCurrentEmailIndex(2);
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
                            value={getEmailTemplatesForCategory(selectedEmailCategory)?.[2] || ""}
                            readOnly
                            tabIndex={-1}
                            rows={2}
                            className="resize-none bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-700 border-gray-200 dark:border-gray-700 pointer-events-none overflow-hidden scrollbar-hide"
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 via-gray-50/80 dark:from-gray-800 dark:via-gray-800/80 to-transparent pointer-events-none rounded-b-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Resume Tab */}
            <TabsContent value="resume" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  {!showNewCategoryInput.resume ? (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="resume-category">Resume Category</Label>
                        <Select 
                          value={selectedResumeCategory} 
                          onValueChange={(value) => {
                            if (value === "__new_category__") {
                              setShowNewCategoryInput(prev => ({ ...prev, resume: true }));
                            } else {
                              setSelectedResumeCategory(value);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getResumeCategories().map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{category}</span>
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="__new_category__">
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <PlusCircle className="w-4 h-4" />
                                <span>New Category</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedResumeCategory && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditCategory('resume', selectedResumeCategory)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory('resume', selectedResumeCategory)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="new-resume-category">New Category Name</Label>
                        <Input
                          id="new-resume-category"
                          placeholder="Enter new category name..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => handleAddCategory('resume')} size="sm">
                        Add
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowNewCategoryInput(prev => ({ ...prev, resume: false }));
                          setNewCategoryName("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>

                {editingCategory?.type === 'resume' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-resume-category">Edit Category Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-resume-category"
                        placeholder="Enter category name..."
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                      <Button onClick={handleSaveEditCategory} size="sm">
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {selectedResumeCategory && !showNewCategoryInput.resume && !editingCategory && (
                  <div>
                    <Label htmlFor="resume-link">Resume Link</Label>
                    <Input
                      id="resume-link"
                      type="url"
                      placeholder="Enter resume link (e.g., Google Drive, Dropbox, etc.)..."
                      defaultValue={mockResumeData[selectedResumeCategory as keyof typeof mockResumeData] || ""}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cover Letter Tab */}
            <TabsContent value="coverLetter" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  {!showNewCategoryInput.coverLetter ? (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="coverletter-category">Cover Letter Category</Label>
                        <Select 
                          value={selectedCoverLetterCategory} 
                          onValueChange={(value) => {
                            if (value === "__new_category__") {
                              setShowNewCategoryInput(prev => ({ ...prev, coverLetter: true }));
                            } else {
                              setSelectedCoverLetterCategory(value);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getCoverLetterCategories().map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{category}</span>
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="__new_category__">
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <PlusCircle className="w-4 h-4" />
                                <span>New Category</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedCoverLetterCategory && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditCategory('coverLetter', selectedCoverLetterCategory)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory('coverLetter', selectedCoverLetterCategory)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="new-coverletter-category">New Category Name</Label>
                        <Input
                          id="new-coverletter-category"
                          placeholder="Enter new category name..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => handleAddCategory('coverLetter')} size="sm">
                        Add
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowNewCategoryInput(prev => ({ ...prev, coverLetter: false }));
                          setNewCategoryName("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>

                {editingCategory?.type === 'coverLetter' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-coverletter-category">Edit Category Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-coverletter-category"
                        placeholder="Enter category name..."
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                      <Button onClick={handleSaveEditCategory} size="sm">
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {selectedCoverLetterCategory && !showNewCategoryInput.coverLetter && !editingCategory && (
                  <div>
                    <Label htmlFor="coverletter-link">Cover Letter Link</Label>
                    <Input
                      id="coverletter-link"
                      type="url"
                      placeholder="Enter cover letter link (e.g., Google Drive, Dropbox, etc.)..."
                      defaultValue={mockCoverLetterData[selectedCoverLetterCategory as keyof typeof mockCoverLetterData] || ""}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {!((activeTab === "email" && selectedEmailCategory === "__preview_all__") || 
              (activeTab === "resume" && selectedResumeCategory === "__preview_all__") || 
              (activeTab === "coverLetter" && selectedCoverLetterCategory === "__preview_all__")) && (
            <div className="flex justify-end mt-6">
              <Button className="px-6">
                Save Personal Data
              </Button>
            </div>
          )}
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
                  onClick={async () => {
                    if (!emailData || !selectedEmailCategory) return;
                    
                    try {
                      // Update the email templates in the backend
                      const currentTemplates = getEmailTemplatesForCategory(selectedEmailCategory);
                      const updatedTemplates = [...currentTemplates];
                      updatedTemplates[currentEmailIndex] = editingEmailContent;
                      
                      const updateData = {
                        [selectedEmailCategory]: updatedTemplates
                      };

                      const updatedEmailData = await profileApi.updateEmailData(updateData);
                      setEmailData(updatedEmailData);
                      
                      setCurrentEmailContent(editingEmailContent);
                      setIsEditMode(false);
                      setEditingEmailContent("");
                      
                      toast({
                        title: "Email Content Saved",
                        description: "Your changes have been saved successfully",
                        className: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 dark:border-green-400",
                      });
                    } catch (error) {
                      console.error('Failed to update email template:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update email template. Please try again.",
                        variant: "destructive",
                      });
                    }
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

      {/* General Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            General Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Notification Client</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'WhatsApp', icon: WhatsAppIcon, color: 'text-green-600 dark:text-green-400' },
                { name: 'Signal', icon: SignalIcon, color: 'text-blue-600 dark:text-blue-400' },
                { name: 'Telegram', icon: TelegramIcon, color: 'text-blue-500 dark:text-blue-300' },
                { name: 'X', icon: XIcon, color: 'text-black dark:text-white' },
                { name: 'Discord', icon: DiscordIcon, color: 'text-indigo-600 dark:text-indigo-400' },
                { name: 'Mail', icon: Mail, color: 'text-gray-600 dark:text-gray-400' },
                { name: 'Mountains', icon: MountainsIcon, color: 'text-slate-700 dark:text-slate-300' },
              ].map((client) => {
                const isConnected = getClientConnectionStatus(client.name);
                return (
                  <Button
                    key={client.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNotificationClient(client.name)}
                    className="flex flex-col items-center gap-1 h-20 w-36 py-3 px-2"
                  >
                    <div className="flex items-center gap-2">
                      <client.icon className={`w-4 h-4 ${client.color}`} />
                      <span>{client.name === 'X' ? 'Twitter' : client.name}</span>
                    </div>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Disconnected
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <hr className="border-border" />

          {/* Notification Settings for Selected Client */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Email Views</Label>
                <p className="text-sm text-muted-foreground">Get notified through {selectedNotificationClient === 'X' ? 'Twitter' : selectedNotificationClient} when emails are viewed</p>
              </div>
              <Switch 
                checked={getNotificationSettingsForClient(selectedNotificationClient)?.emailViews || false}
                onCheckedChange={(checked) => handleNotificationToggle(selectedNotificationClient, 'emailViews', checked)}
                data-testid={`switch-${selectedNotificationClient.toLowerCase()}-email-views`} 
              />
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Resume Views</Label>
                <p className="text-sm text-muted-foreground">Get notified through {selectedNotificationClient === 'X' ? 'Twitter' : selectedNotificationClient} when resume links are viewed</p>
              </div>
              <Switch 
                checked={getNotificationSettingsForClient(selectedNotificationClient)?.resumeViews || false}
                onCheckedChange={(checked) => handleNotificationToggle(selectedNotificationClient, 'resumeViews', checked)}
                data-testid={`switch-${selectedNotificationClient.toLowerCase()}-resume-views`} 
              />
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Responses</Label>
                <p className="text-sm text-muted-foreground">Get notified through {selectedNotificationClient === 'X' ? 'Twitter' : selectedNotificationClient} when you receive responses</p>
              </div>
              <Switch 
                checked={getNotificationSettingsForClient(selectedNotificationClient)?.responses || false}
                onCheckedChange={(checked) => handleNotificationToggle(selectedNotificationClient, 'responses', checked)}
                data-testid={`switch-${selectedNotificationClient.toLowerCase()}-responses`} 
              />
            </div>
            
            {/* Connect/Disconnect Button */}
            <div className="flex justify-end pt-4">
              {!getClientConnectionStatus(selectedNotificationClient) ? (
                <Button
                  onClick={() => handleClientConnect(selectedNotificationClient)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Connect to {selectedNotificationClient === 'X' ? 'Twitter' : selectedNotificationClient} client
                </Button>
              ) : (
                <Button
                  onClick={() => handleClientDisconnect(selectedNotificationClient)}
                  variant="destructive"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  Disconnect {selectedNotificationClient === 'X' ? 'Twitter' : selectedNotificationClient} client
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Email Tracking</Label>
              <p className="text-sm text-muted-foreground">Enable tracking pixels in outbound emails</p>
            </div>
            <Switch defaultChecked data-testid="switch-email-tracking" />
          </div>
          <hr className="border-border" />
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleDeleteAccount}
              data-testid="button-delete-account"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Photo Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          
          <Tabs value={photoDialogTab} onValueChange={(value) => setPhotoDialogTab(value as "preview" | "upload")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-4">
              <div className="flex flex-col items-center space-y-4">
                {profileImage ? (
                  <div className="w-full max-w-md">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-auto rounded-lg object-contain max-h-96"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-4xl font-medium text-primary-foreground">AJ</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {profileImage ? "Your current profile photo" : "No profile photo set"}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="mt-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-gray-300 hover:border-primary'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFilePicker}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{deleteConfirmation?.categoryName}"? 
              {deleteConfirmation?.type === 'email' && " This will remove all email templates associated with this category."}
              {deleteConfirmation?.type === 'resume' && " This will remove all resume links associated with this category."}
              {deleteConfirmation?.type === 'coverLetter' && " This will remove all cover letter links associated with this category."}
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Confirmation Dialog */}
      <AlertDialog open={confirmationDialog.isOpen} onOpenChange={(open) => 
        setConfirmationDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Notification Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to {confirmationDialog.value ? 'enable' : 'disable'} {confirmationDialog.settingLabel.toLowerCase()} notifications through {confirmationDialog.client === 'X' ? 'Twitter' : confirmationDialog.client} client?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmNotificationToggle}>
              {confirmationDialog.value ? 'Enable' : 'Disable'} Notifications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
