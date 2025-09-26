import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { applicationFormSchema, type ApplicationForm } from "@shared/schema";
import { useState } from "react";
import { FileText } from "lucide-react";

export default function Apply() {
  const { toast } = useToast();
  const [estimatedAmount, setEstimatedAmount] = useState(0);

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: "",
      pan: "",
      dematNo: "",
      sharesReq: 0,
      applicantId: 0,
      companyId: 0,
      amount: 0,
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: ApplicationForm) => apiRequest("POST", "/api/applications", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      form.reset();
      setEstimatedAmount(0);
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationForm) => {
    const pricePerShare = dashboardData?.company?.price || 350;
    const submissionData = {
      ...data,
      amount: data.sharesReq * pricePerShare,
    };
    submitMutation.mutate(submissionData);
  };

  const watchShares = form.watch("sharesReq");
  const pricePerShare = dashboardData?.company?.price || 350;

  // Update estimated amount when shares change
  useState(() => {
    const amount = (watchShares || 0) * pricePerShare;
    setEstimatedAmount(amount);
  });

  return (
    <div className="flex-1 ml-64 p-6">
      <header className="mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Apply for IPO</h2>
          <p className="text-muted-foreground mt-1">Submit your application for IPO shares</p>
        </div>
      </header>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              IPO Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCDE1234F" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            field.onChange(value);
                          }}
                          data-testid="input-pan"
                        />
                      </FormControl>
                      <FormDescription>
                        Format: ABCDE1234F (5 letters + 4 digits + 1 letter)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dematNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demat Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234567890123456" 
                          {...field}
                          data-testid="input-demat"
                        />
                      </FormControl>
                      <FormDescription>
                        16-digit demat account number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sharesReq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Shares</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          min="1"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                            setEstimatedAmount(value * pricePerShare);
                          }}
                          data-testid="input-shares"
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum: 1 share | Price per share: ₹{pricePerShare}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Amount:</span>
                    <span className="font-semibold text-foreground" data-testid="text-estimated-amount">
                      ₹{estimatedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* IPO Details */}
        {dashboardData?.company && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>IPO Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-semibold">{dashboardData.company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per Share</p>
                  <p className="font-semibold">₹{dashboardData.company.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Shares</p>
                  <p className="font-semibold">{dashboardData.company.totalShares.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Status</p>
                  <p className="font-semibold">
                    {dashboardData.oversubscriptionRatio?.toFixed(1)}x 
                    {(dashboardData.oversubscriptionRatio || 0) > 1 ? " Oversubscribed" : " Available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
