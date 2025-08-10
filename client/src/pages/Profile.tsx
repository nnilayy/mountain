import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();

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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-primary-foreground">AJ</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold" data-testid="text-profile-name">Alex Johnson</h2>
              <p className="text-muted-foreground">Senior Recruiter at Mountains</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>alex.johnson@mountains.com</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>San Francisco, CA</span>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="alex.johnson@mountains.com" 
                data-testid="input-email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  defaultValue="+1 (555) 123-4567" 
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  defaultValue="Mountains" 
                  data-testid="input-company"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                defaultValue="San Francisco, CA" 
                data-testid="input-location"
              />
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              className="w-full"
              data-testid="button-update-profile"
            >
              Update Profile
            </Button>
          </CardContent>
        </Card>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Email Opens</Label>
                <p className="text-sm text-muted-foreground">Get notified when emails are opened</p>
              </div>
              <Switch defaultChecked data-testid="switch-email-opens" />
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Resume Clicks</Label>
                <p className="text-sm text-muted-foreground">Get notified when resume links are clicked</p>
              </div>
              <Switch defaultChecked data-testid="switch-resume-clicks" />
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Weekly Report</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summary</p>
              </div>
              <Switch data-testid="switch-weekly-report" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
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
      </div>


    </div>
  );
}
