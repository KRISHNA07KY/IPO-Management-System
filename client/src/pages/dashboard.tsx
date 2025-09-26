import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building, FileText, PieChart, IndianRupee, Calculator, DollarSign, Download, Database } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: allotments = [], isLoading: allotmentsLoading } = useQuery({
    queryKey: ["/api/allotments"],
  });

  const applicationsArray = Array.isArray(applications) ? applications : [];
  const allotmentsArray = Array.isArray(allotments) ? allotments : [];
  const dashboardDataObj = dashboardData as any;

  const allotmentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/allotment"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Allotment process completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/allotments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/refunds"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Refunds calculated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/allotments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (dashboardLoading) {
    return (
      <div className="flex-1 ml-64 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString()}`;
  };

  return (
    <div className="flex-1 ml-64 p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">IPO Dashboard</h2>
            <p className="text-muted-foreground mt-1">Monitor and manage IPO applications and allotments</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/new-ipo">
              <Button className="bg-primary text-primary-foreground" data-testid="button-new-ipo">
                <Building className="mr-2 h-4 w-4" />
                New IPO
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active IPO</p>
                <p className="text-2xl font-bold text-card-foreground mt-1">
                  {dashboardDataObj?.company?.name || "No Active IPO"}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                <Building className="text-chart-1 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-2/10 text-chart-2">Active</Badge>
                <span className="text-muted-foreground text-xs">
                  Price: ₹{dashboardDataObj?.company?.price || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-card-foreground mt-1" data-testid="text-total-applications">
                  {dashboardDataObj?.totalApplications || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center">
                <FileText className="text-chart-2 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-chart-2 text-sm font-medium">Applications received</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Shares Demanded</p>
                <p className="text-2xl font-bold text-card-foreground mt-1" data-testid="text-shares-demanded">
                  {dashboardDataObj?.totalSharesReq?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
                <PieChart className="text-chart-3 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-chart-3 text-sm font-medium">
                {dashboardDataObj?.oversubscriptionRatio?.toFixed(1)}x oversubscribed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-card-foreground mt-1" data-testid="text-total-value">
                  {formatNumber(dashboardDataObj?.totalAmount || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-4/10 rounded-xl flex items-center justify-center">
                <IndianRupee className="text-chart-4 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-chart-4 text-sm font-medium">
                Share price: ₹{dashboardDataObj?.company?.price || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Center */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => allotmentMutation.mutate()}
              disabled={allotmentMutation.isPending}
              className="bg-primary text-primary-foreground"
              data-testid="button-run-allotment"
            >
              <Calculator className="mr-2 h-4 w-4" />
              {allotmentMutation.isPending ? "Processing..." : "Run Allotment Process"}
            </Button>
            <Button 
              onClick={() => refundMutation.mutate()}
              disabled={refundMutation.isPending}
              className="bg-chart-2 text-white hover:bg-chart-2/90"
              data-testid="button-calculate-refunds"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {refundMutation.isPending ? "Calculating..." : "Calculate Refunds"}
            </Button>
            <Button variant="outline" data-testid="button-export-report">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="link" className="text-primary">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {applicationsArray.slice(0, 3).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-chart-1/10 rounded-full flex items-center justify-center">
                      <FileText className="text-chart-1 text-sm h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{app.applicant_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{app.pan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-card-foreground">{app.shares_req} shares</p>
                    <p className="text-xs text-muted-foreground">₹{app.amount?.toLocaleString()}</p>
                  </div>
                  <div className="ml-4">
                    <Badge className={
                      app.shares_alloted 
                        ? "bg-chart-2/10 text-chart-2" 
                        : "bg-chart-3/10 text-chart-3"
                    }>
                      {app.shares_alloted ? "Allotted" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allotment Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Allotment Results</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-filter">
                Filter
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allotmentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead className="text-right">Requested</TableHead>
                    <TableHead className="text-right">Allotted</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="text-right">Refund</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allotmentsArray.map((result: any) => (
                    <TableRow key={result.id} className="hover:bg-muted transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center">
                            <FileText className="text-chart-1 h-4 w-4" />
                          </div>
                          <span className="font-medium text-card-foreground">{result.applicant_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{result.pan}</TableCell>
                      <TableCell className="text-right font-medium text-card-foreground">{result.shares_req}</TableCell>
                      <TableCell className="text-right font-semibold text-chart-2">{result.shares_alloted || "-"}</TableCell>
                      <TableCell className="text-right text-card-foreground">₹{result.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-chart-3">
                        {result.refund_amount ? `₹${result.refund_amount.toLocaleString()}` : "₹0"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          result.status === "Processed" 
                            ? "bg-chart-2/10 text-chart-2"
                            : result.status === "Allotted"
                            ? "bg-chart-4/10 text-chart-4"
                            : "bg-chart-3/10 text-chart-3"
                        }>
                          {result.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                <PieChart className="text-chart-1 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Oversubscription Ratio</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-oversubscription-ratio">
                  {dashboardDataObj?.oversubscriptionRatio?.toFixed(1)}x
                </p>
                <p className="text-chart-1 text-sm font-medium">
                  {(dashboardDataObj?.oversubscriptionRatio || 0) > 1 ? "Oversubscribed" : "Undersubscribed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
                <DollarSign className="text-chart-3 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Refunds</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-refunds">
                  {formatNumber(dashboardDataObj?.totalRefunds || 0)}
                </p>
                <p className="text-chart-3 text-sm font-medium">From excess applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center">
                <Calculator className="text-chart-2 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Allotment Status</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-allotment-progress">
                  {allotmentsArray.length > 0 ? "100%" : "0%"}
                </p>
                <p className="text-chart-2 text-sm font-medium">
                  {allotmentsArray.length > 0 ? "Process completed" : "Not started"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
