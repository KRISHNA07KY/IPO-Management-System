import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, PieChart, DollarSign, Calculator } from "lucide-react";

export default function Reports() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: allotments = [], isLoading: allotmentsLoading } = useQuery({
    queryKey: ["/api/allotments"],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString()}`;
  };

  if (dashboardLoading || allotmentsLoading || applicationsLoading) {
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
            <h2 className="text-3xl font-bold text-foreground">Reports & Analytics</h2>
            <p className="text-muted-foreground mt-1">Comprehensive IPO performance reports</p>
          </div>
          <Button variant="outline" data-testid="button-export-all">
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>
      </header>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                <PieChart className="text-chart-1 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Oversubscription Ratio</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-oversubscription-ratio">
                  {dashboardData?.oversubscriptionRatio?.toFixed(1)}x
                </p>
                <p className="text-chart-1 text-sm font-medium">
                  {(dashboardData?.oversubscriptionRatio || 0) > 1 ? "Highly oversubscribed" : "Undersubscribed"}
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
                  {formatNumber(dashboardData?.totalRefunds || 0)}
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
                  {allotments.length > 0 ? "100%" : "0%"}
                </p>
                <p className="text-chart-2 text-sm font-medium">
                  {allotments.length > 0 ? "Process completed" : "Not started"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Application Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Applications</span>
                <span className="font-semibold" data-testid="text-total-applications">
                  {dashboardData?.totalApplications || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Shares Requested</span>
                <span className="font-semibold" data-testid="text-total-shares-requested">
                  {dashboardData?.totalSharesReq?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold" data-testid="text-total-amount">
                  {formatNumber(dashboardData?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available Shares</span>
                <span className="font-semibold" data-testid="text-available-shares">
                  {dashboardData?.company?.totalShares?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Demand vs Supply</span>
                <span className="font-semibold text-chart-1" data-testid="text-demand-supply">
                  {dashboardData?.oversubscriptionRatio?.toFixed(1) || 0}x
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">IPO Price per Share</span>
                <span className="font-semibold" data-testid="text-ipo-price">
                  ₹{dashboardData?.company?.price || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total IPO Value</span>
                <span className="font-semibold" data-testid="text-total-ipo-value">
                  {formatNumber((dashboardData?.company?.totalShares || 0) * (dashboardData?.company?.price || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Applied Amount</span>
                <span className="font-semibold" data-testid="text-total-applied-amount">
                  {formatNumber(dashboardData?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Refund Amount</span>
                <span className="font-semibold text-chart-3" data-testid="text-total-refund-amount">
                  {formatNumber(dashboardData?.totalRefunds || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-chart-2" data-testid="text-success-rate">
                  {allotments.length > 0 && applications.length > 0 
                    ? `${((allotments.length / applications.length) * 100).toFixed(1)}%`
                    : "0%"
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Allotment Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detailed Allotment Report</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-export-allotment">
              <Download className="mr-2 h-4 w-4" />
              Export
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
                  <TableHead>Demat No</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Allotted</TableHead>
                  <TableHead className="text-right">Allotment %</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Refund</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allotments.map((result: any) => {
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
                      <TableCell className="text-muted-foreground font-mono text-sm">{result.demat_no}</TableCell>
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
          
          {allotments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No allotment data available. Run the allotment process first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
