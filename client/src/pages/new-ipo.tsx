import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { z } from "zod";

const newIpoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  totalShares: z.number().min(1, "Must have at least 1 share"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type NewIpoForm = z.infer<typeof newIpoSchema>;

export default function NewIpo() {
  const { toast } = useToast();

  const form = useForm<NewIpoForm>({
    resolver: zodResolver(newIpoSchema),
    defaultValues: {
      name: "",
      totalShares: 0,
      price: 0,
      startDate: "",
      endDate: "",
    },
  });

  const createIpoMutation = useMutation({
    mutationFn: (data: NewIpoForm) => apiRequest("POST", "/api/companies", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "IPO created successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create IPO",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewIpoForm) => {
    createIpoMutation.mutate(data);
  };

  const watchTotalShares = form.watch("totalShares");
  const watchPrice = form.watch("price");
  const totalValue = (watchTotalShares || 0) * (watchPrice || 0);

  return (
    <div className="flex-1 ml-64 p-6">
      <header className="mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Create New IPO</h2>
          <p className="text-muted-foreground mt-1">Launch a new Initial Public Offering</p>
        </div>
      </header>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building className="h-6 w-6" />
              IPO Details
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
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter company name" 
                          {...field}
                          data-testid="input-company-name"
                        />
                      </FormControl>
                      <FormDescription>
                        The official name of the company going public
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalShares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Shares</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500000" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-total-shares"
                          />
                        </FormControl>
                        <FormDescription>
                          Total number of shares to offer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Share (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="350" 
                            min="0.01"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-share-price"
                          />
                        </FormControl>
                        <FormDescription>
                          IPO price per share in rupees
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            data-testid="input-start-date"
                          />
                        </FormControl>
                        <FormDescription>
                          IPO opening date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            data-testid="input-end-date"
                          />
                        </FormControl>
                        <FormDescription>
                          IPO closing date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-muted rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    IPO Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Shares</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="text-summary-shares">
                        {(watchTotalShares || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Share Price</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="text-summary-price">
                        ₹{(watchPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Total IPO Value</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-summary-value">
                        ₹{totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground"
                  disabled={createIpoMutation.isPending}
                  data-testid="button-create-ipo"
                >
                  {createIpoMutation.isPending ? "Creating IPO..." : "Create IPO"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 mt-0.5 text-chart-1" />
                <div>
                  <p className="font-medium text-foreground">Pricing Strategy</p>
                  <p>Set competitive pricing based on market conditions and company valuation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 mt-0.5 text-chart-2" />
                <div>
                  <p className="font-medium text-foreground">Share Allocation</p>
                  <p>Ensure sufficient shares are available for public subscription.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-chart-3" />
                <div>
                  <p className="font-medium text-foreground">Timeline</p>
                  <p>Allow adequate time between start and end dates for applications.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}