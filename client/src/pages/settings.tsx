import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";
import { z } from "zod";
import { 
  Settings as SettingsIcon, 
  Building, 
  Database, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Upload,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Monitor,
  Save
} from "lucide-react";

// Settings schemas
const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  defaultIpoPrice: z.number().min(1, "Price must be greater than 0"),
  defaultIpoShares: z.number().min(1, "Shares must be greater than 0"),
});

const systemSettingsSchema = z.object({
  enableNotifications: z.boolean(),
  autoAllotment: z.boolean(),
  autoRefunds: z.boolean(),
  emailNotifications: z.boolean(),
  maxApplicationsPerUser: z.number().min(1).max(10),
  defaultAllotmentMode: z.enum(["first-come", "pro-rata", "lottery"]),
  theme: z.enum(["light", "dark", "system"]),
});

const securitySettingsSchema = z.object({
  requireStrongPassword: z.boolean(),
  sessionTimeout: z.number().min(15).max(480), // 15 minutes to 8 hours
  enableTwoFactor: z.boolean(),
  auditLogging: z.boolean(),
});

type CompanySettings = z.infer<typeof companySettingsSchema>;
type SystemSettings = z.infer<typeof systemSettingsSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;

interface Settings {
  company: CompanySettings;
  system: SystemSettings;
  security: SecuritySettings;
}

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("company");
  const [isDirty, setIsDirty] = useState(false);

  // Fetch settings from API
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/settings");
      return await response.json();
    },
  });

  const settingsData = (settings as Settings) || {
    company: {
      companyName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      defaultIpoPrice: 100,
      defaultIpoShares: 100000,
    },
    system: {
      enableNotifications: true,
      autoAllotment: false,
      autoRefunds: false,
      emailNotifications: false,
      maxApplicationsPerUser: 1,
      defaultAllotmentMode: "pro-rata" as const,
      theme: "system" as const,
    },
    security: {
      requireStrongPassword: true,
      sessionTimeout: 60,
      enableTwoFactor: false,
      auditLogging: true,
    },
  };

  const companyForm = useForm<CompanySettings>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: settingsData.company,
  });

  const systemForm = useForm<SystemSettings>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: settingsData.system,
  });

  const securityForm = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settingsData.security,
  });

  // Save settings to API
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const response = await apiRequest("PUT", "/api/settings", newSettings);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/export"),
    onSuccess: () => {
      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetDataMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/reset"),
    onSuccess: () => {
      toast({
        title: "Data reset",
        description: "All data has been reset successfully.",
      });
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({
        title: "Reset failed",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async (section: keyof Settings, data: any) => {
    await saveSettingsMutation.mutateAsync({ [section]: data });
  };

  const tabs = [
    { id: "company", label: "Company", icon: Building },
    { id: "system", label: "System", icon: SettingsIcon },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data Management", icon: Database },
  ];

  return (
    <div className="flex-1 ml-64 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Settings</h2>
            <p className="text-muted-foreground mt-1">Manage your IPO system configuration</p>
          </div>
          {isDirty && (
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved changes
            </Badge>
          )}
        </div>
      </header>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      data-testid={`tab-${tab.id}`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Settings
                </CardTitle>
                <CardDescription>
                  Configure your company information and default IPO settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...companyForm}>
                  <form
                    onSubmit={companyForm.handleSubmit((data) => handleSaveSettings("company", data))}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={companyForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your Company Ltd" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="admin@company.com" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+1-555-0123" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="defaultIpoPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default IPO Price (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="350" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value));
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Default price per share for new IPOs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="defaultIpoShares"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default IPO Shares</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="500000" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value));
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Default number of shares for new IPOs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={companyForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="123 Business Street, City, State, ZIP" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setIsDirty(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={saveSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveSettingsMutation.isPending ? "Saving..." : "Save Company Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "system" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system behavior and default preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...systemForm}>
                  <form
                    onSubmit={systemForm.handleSubmit((data) => handleSaveSettings("system", data))}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="enableNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Notifications</FormLabel>
                              <FormDescription>
                                Show system notifications for important events
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={systemForm.control}
                        name="autoAllotment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Auto Allotment</FormLabel>
                              <FormDescription>
                                Automatically run allotment when IPO closes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={systemForm.control}
                        name="autoRefunds"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Auto Refunds</FormLabel>
                              <FormDescription>
                                Automatically calculate refunds after allotment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={systemForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Send email notifications to applicants
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="maxApplicationsPerUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Applications Per User</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1"
                                max="10"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value));
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of applications a user can submit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={systemForm.control}
                        name="defaultAllotmentMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Allotment Mode</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setIsDirty(true);
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select allotment mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="first-come">First Come First Serve</SelectItem>
                                <SelectItem value="pro-rata">Pro-rata</SelectItem>
                                <SelectItem value="lottery">Lottery System</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default method for share allotment
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Theme
                        </label>
                        <Select 
                          onValueChange={(value) => {
                            setTheme(value as "light" | "dark" | "system");
                            toast({
                              title: "Theme changed",
                              description: `Theme has been changed to ${value}`,
                            });
                          }} 
                          value={theme}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4" />
                                Light
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="w-4 h-4" />
                                Dark
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                System
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred theme. Changes apply immediately.
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={saveSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveSettingsMutation.isPending ? "Saving..." : "Save System Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form
                    onSubmit={securityForm.handleSubmit((data) => handleSaveSettings("security", data))}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="requireStrongPassword"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Strong Passwords</FormLabel>
                              <FormDescription>
                                Enforce strong password requirements for all users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="enableTwoFactor"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                              <FormDescription>
                                Require 2FA for admin access
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="auditLogging"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Audit Logging</FormLabel>
                              <FormDescription>
                                Log all user actions for security auditing
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="15"
                                max="480"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value));
                                  setIsDirty(true);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Automatically log out users after inactivity (15-480 minutes)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={saveSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveSettingsMutation.isPending ? "Saving..." : "Save Security Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your IPO system data, backups, and maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Export & Backup</h4>
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => exportDataMutation.mutate()}
                          disabled={exportDataMutation.isPending}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {exportDataMutation.isPending ? "Exporting..." : "Export All Data"}
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Database Maintenance</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Optimize Database
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Data Integrity
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                      <div className="space-y-3 flex-1">
                        <div>
                          <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            These actions cannot be undone. Please proceed with caution.
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
                              resetDataMutation.mutate();
                            }
                          }}
                          disabled={resetDataMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {resetDataMutation.isPending ? "Resetting..." : "Reset All Data"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <span className="ml-2 font-mono">1.0.0</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Database:</span>
                      <span className="ml-2 font-mono">SQLite</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Backup:</span>
                      <span className="ml-2">Never</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Environment:</span>
                      <span className="ml-2 font-mono">Development</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}