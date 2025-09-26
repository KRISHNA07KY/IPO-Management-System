import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Calculator, DollarSign, FileText, Download, PieChart, Play, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function Allotments() {
  const { toast } = useToast();
  const [allotmentDialogOpen, setAllotmentDialogOpen] = useState(false);
  const [allotmentProgress, setAllotmentProgress] = useState(0);
  const [allotmentStatus, setAllotmentStatus] = useState<'idle' | 'validating' | 'calculating' | 'complete'>('idle');

  const { data: allotments = [], isLoading } = useQuery({
    queryKey: ["/api/allotments"],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const allotmentMutation = useMutation({
    mutationFn: async () => {
      setAllotmentStatus('validating');
      setAllotmentProgress(25);
      
      // Simulate validation step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAllotmentStatus('calculating');
      setAllotmentProgress(75);
      
      const result = await apiRequest("POST", "/api/allotment");
      
      setAllotmentStatus('complete');
      setAllotmentProgress(100);
      
      return result;
    },
    onSuccess: () => {
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Allotment process completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/allotments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        setAllotmentDialogOpen(false);
        setAllotmentStatus('idle');
        setAllotmentProgress(0);
      }, 1000);
    },
    onError: (error: Error) => {
      setAllotmentStatus('idle');
      setAllotmentProgress(0);
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

  const allotmentsArray = Array.isArray(allotments) ? allotments : [];
  const applicationsArray = Array.isArray(applications) ? applications : [];
  const companiesArray = Array.isArray(companies) ? companies : [];
  
  const totalAllotted = allotmentsArray.reduce((sum: number, allot: any) => sum + (allot.shares_alloted || 0), 0);
  const totalRequested = allotmentsArray.reduce((sum: number, allot: any) => sum + allot.shares_req, 0);
  const totalRefunds = allotmentsArray.reduce((sum: number, allot: any) => sum + (allot.refund_amount || 0), 0);
  
  const totalAvailable = companiesArray[0]?.total_shares || 0;
  const oversubscriptionRatio = totalAvailable > 0 ? (totalRequested / totalAvailable) : 0;
  
  const canRunAllotment = applicationsArray.length > 0 && allotmentsArray.length === 0;
  
  const runAllotmentProcess = () => {
    setAllotmentDialogOpen(true);
    allotmentMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex-1 ml-64 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-64 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Allotments</h2>
            <p className="text-muted-foreground mt-1">Manage IPO share allotments and refunds</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runAllotmentProcess}
              disabled={!canRunAllotment || allotmentMutation.isPending}
              className="bg-primary text-primary-foreground"
              data-testid="button-run-allotment"
            >
              <Play className="mr-2 h-4 w-4" />
              Run Allotment Process
            </Button>
            
            <Dialog open={allotmentDialogOpen} onOpenChange={setAllotmentDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>IPO Allotment Process</DialogTitle>
                  <DialogDescription>
                    Processing share allotments for all applications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{allotmentProgress}%</span>
                    </div>
                    <Progress value={allotmentProgress} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      allotmentStatus === 'validating' ? 'bg-yellow-50 border border-yellow-200' : 
                      allotmentProgress >= 25 ? 'bg-green-50 border border-green-200' : 
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      {allotmentStatus === 'validating' ? (
                        <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
                      ) : allotmentProgress >= 25 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Validating Applications</p>
                        <p className="text-xs text-muted-foreground">Checking {applicationsArray.length} applications</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      allotmentStatus === 'calculating' ? 'bg-blue-50 border border-blue-200' : 
                      allotmentProgress >= 75 ? 'bg-green-50 border border-green-200' : 
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      {allotmentStatus === 'calculating' ? (
                        <Calculator className="h-5 w-5 text-blue-600 animate-pulse" />
                      ) : allotmentProgress >= 75 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Calculating Allotments</p>
                        <p className="text-xs text-muted-foreground">
                          {oversubscriptionRatio > 1 ? 'Applying pro-rata allotment' : 'Full allotment available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      allotmentStatus === 'complete' ? 'bg-green-50 border border-green-200' : 
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      {allotmentStatus === 'complete' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Process Complete</p>
                        <p className="text-xs text-muted-foreground">Allotments saved to database</p>
                      </div>
                    </div>
                  </div>
                  
                  {allotmentStatus === 'complete' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-green-800">Allotment Completed Successfully!</p>
                      </div>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>• Processed {applicationsArray.length} applications</p>
                        <p>• Oversubscription ratio: {oversubscriptionRatio.toFixed(2)}x</p>
                        <p>• Ready for refund calculation</p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={() => refundMutation.mutate()}
              disabled={refundMutation.isPending}
              className="bg-chart-2 text-white hover:bg-chart-2/90"
              data-testid="button-calculate-refunds"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {refundMutation.isPending ? "Calculating..." : "Calculate Refunds"}
            </Button>
          </div>
        </div>
      </header>

      {/* Pre-Allotment Summary */}
      {canRunAllotment && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Ready for Allotment Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-orange-800">{applicationsArray.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shares Available</p>
                <p className="text-2xl font-bold text-orange-800">{totalAvailable.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Oversubscription</p>
                <p className="text-2xl font-bold text-orange-800">{oversubscriptionRatio.toFixed(2)}x</p>
              </div>
            </div>
            <p className="text-xs text-orange-700 mt-4">
              {oversubscriptionRatio > 1 
                ? "IPO is oversubscribed. Pro-rata allotment will be applied."
                : "IPO is undersubscribed. Full allotment will be given to all applicants."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                <PieChart className="text-chart-1 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Shares Requested</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-shares-requested">
                  {totalRequested.toLocaleString()}
                </p>
                <p className="text-chart-1 text-sm font-medium">Total demand</p>
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
                <p className="text-muted-foreground text-sm">Shares Allotted</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-shares-allotted">
                  {totalAllotted.toLocaleString()}
                </p>
                <p className="text-chart-2 text-sm font-medium">Total allocated</p>
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
                  ₹{totalRefunds.toLocaleString()}
                </p>
                <p className="text-chart-3 text-sm font-medium">Excess amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-4/10 rounded-xl flex items-center justify-center">
                <FileText className="text-chart-4 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Allotment Ratio</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-allotment-ratio">
                  {totalRequested > 0 ? ((totalAllotted / totalRequested) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-chart-4 text-sm font-medium">Success rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allotment Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Allotment Results</CardTitle>
            <Button variant="outline" data-testid="button-export-allotments">
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Allotted</TableHead>
                  <TableHead className="text-right">Allotment %</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Refund</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allotmentsArray.map((result: any) => {
                  const allotmentPercentage = result.shares_alloted && result.shares_req 
                    ? ((result.shares_alloted / result.shares_req) * 100).toFixed(1)
                    : "0";
                    
                  return (
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
                      <TableCell className="text-right text-muted-foreground">{allotmentPercentage}%</TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {allotmentsArray.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No allotments processed yet</p>
              <p className="text-sm">Run the allotment process to see results here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}