import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, PieChart, DollarSign, Calculator, Filter, Printer, BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [reportType, setReportType] = useState("overview");
  const [exportFormat, setExportFormat] = useState("pdf");
  const { toast } = useToast();
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: allotments = [], isLoading: allotmentsLoading } = useQuery({
    queryKey: ["/api/allotments"],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  const applicationsArray = Array.isArray(applications) ? applications : [];
  const allotmentsArray = Array.isArray(allotments) ? allotments : [];
  const dashboardDataObj = dashboardData as any;

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString()}`;
  };

  // Export functionality
  const handleExport = async (type: string) => {
    try {
      const response = await apiRequest("GET", `/api/export/${type}`);
      
      // Create download link
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ipo-${type}-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${type} report has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report data",
        variant: "destructive",
      });
    }
  };

  // Prepare chart data
  const allotmentData = allotmentsArray.map((item: any, index: number) => ({
    name: `Applicant ${index + 1}`,
    requested: item.shares_req,
    allotted: item.shares_alloted || 0,
    refund: item.refund_amount || 0,
  }));

  const oversubscriptionData = [
    {
      name: "Requested",
      value: allotmentsArray.reduce((sum: number, item: any) => sum + item.shares_req, 0),
      color: "#8884d8"
    },
    {
      name: "Available", 
      value: dashboardDataObj?.companies?.[0]?.total_shares || 0,
      color: "#82ca9d"
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Filter data based on report type
  const getFilteredContent = () => {
    switch (reportType) {
      case 'allotments':
        return {
          title: "Allotment Analysis",
          description: "Detailed allotment results and distribution",
          showCharts: true,
          showAllotmentTable: true,
          showApplicationTable: false,
          showRefundTable: false,
        };
      case 'applications':
        return {
          title: "Application Analysis", 
          description: "All IPO applications and their status",
          showCharts: false,
          showAllotmentTable: false,
          showApplicationTable: true,
          showRefundTable: false,
        };
      case 'refunds':
        return {
          title: "Refund Analysis",
          description: "Refund calculations and distribution",
          showCharts: false,
          showAllotmentTable: false,
          showApplicationTable: false,
          showRefundTable: true,
        };
      default: // overview
        return {
          title: "IPO Overview Report",
          description: "Comprehensive IPO performance analysis and data insights",
          showCharts: true,
          showAllotmentTable: true,
          showApplicationTable: true,
          showRefundTable: false,
        };
    }
  };

  const reportContent = getFilteredContent();

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
            <h2 className="text-3xl font-bold text-foreground">{reportContent.title}</h2>
            <p className="text-muted-foreground mt-1">{reportContent.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="allotments">Allotments</SelectItem>
                <SelectItem value="applications">Applications</SelectItem>
                <SelectItem value="refunds">Refunds</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => handleExport('allotments')}
              data-testid="button-export-data"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              data-testid="button-print-report"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
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
                  {dashboardDataObj?.oversubscriptionRatio?.toFixed(1)}x
                </p>
                <p className="text-chart-1 text-sm font-medium">
                  {(dashboardDataObj?.oversubscriptionRatio || 0) > 1 ? "Highly oversubscribed" : "Undersubscribed"}
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

      {/* Data Visualization */}
      {reportContent.showCharts && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Demand vs Supply Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Demand vs Supply Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={oversubscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                >
                  {oversubscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Shares']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Allotment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Allotment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allotmentData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requested" fill="#8884d8" name="Requested" />
                <Bar dataKey="allotted" fill="#82ca9d" name="Allotted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Refund Analysis Chart */}
      {allotmentsArray.length > 0 && reportContent.showCharts && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Refund Analysis Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={allotmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Refund Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="refund" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ fill: '#ff7300' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      </>
      )}

      {/* Detailed Reports */}
      {(reportContent.showApplicationTable || reportType === 'overview') && (
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
                  {dashboardDataObj?.totalApplications || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Shares Requested</span>
                <span className="font-semibold" data-testid="text-total-shares-requested">
                  {dashboardDataObj?.totalSharesReq?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold" data-testid="text-total-amount">
                  {formatNumber(dashboardDataObj?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available Shares</span>
                <span className="font-semibold" data-testid="text-available-shares">
                  {dashboardDataObj?.company?.totalShares?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Demand vs Supply</span>
                <span className="font-semibold text-chart-1" data-testid="text-demand-supply">
                  {dashboardDataObj?.oversubscriptionRatio?.toFixed(1) || 0}x
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
                  ₹{dashboardDataObj?.company?.price || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total IPO Value</span>
                <span className="font-semibold" data-testid="text-total-ipo-value">
                  {formatNumber((dashboardDataObj?.company?.totalShares || 0) * (dashboardDataObj?.company?.price || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Applied Amount</span>
                <span className="font-semibold" data-testid="text-total-applied-amount">
                  {formatNumber(dashboardDataObj?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Refund Amount</span>
                <span className="font-semibold text-chart-3" data-testid="text-total-refund-amount">
                  {formatNumber(dashboardDataObj?.totalRefunds || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-chart-2" data-testid="text-success-rate">
                  {allotmentsArray.length > 0 && applicationsArray.length > 0 
                    ? `${((allotmentsArray.length / applicationsArray.length) * 100).toFixed(1)}%`
                    : "0%"
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Detailed Allotment Table */}
      {reportContent.showAllotmentTable && (
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
          
          {allotmentsArray.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No allotment data available. Run the allotment process first.
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Applications-Only Report */}
      {reportType === 'applications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead>Demat No</TableHead>
                    <TableHead className="text-right">Shares Requested</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsArray.map((app: any) => (
                    <TableRow key={app.id} className="hover:bg-muted transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="text-blue-600 h-4 w-4" />
                          </div>
                          <span className="font-medium">{app.applicant_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{app.pan}</TableCell>
                      <TableCell className="font-mono text-sm">{app.demat_no}</TableCell>
                      <TableCell className="text-right font-medium">{app.shares_req}</TableCell>
                      <TableCell className="text-right">₹{app.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {app.shares_alloted ? 'Processed' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refunds-Only Report */}
      {reportType === 'refunds' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Refund Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead className="text-right">Shares Requested</TableHead>
                    <TableHead className="text-right">Shares Allotted</TableHead>
                    <TableHead className="text-right">Excess Shares</TableHead>
                    <TableHead className="text-right">Refund Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allotmentsArray
                    .filter((item: any) => (item.refund_amount || 0) > 0)
                    .map((result: any) => (
                    <TableRow key={result.id} className="hover:bg-muted transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <DollarSign className="text-orange-600 h-4 w-4" />
                          </div>
                          <span className="font-medium">{result.applicant_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{result.pan}</TableCell>
                      <TableCell className="text-right font-medium">{result.shares_req}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{result.shares_alloted}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {result.shares_req - (result.shares_alloted || 0)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-600">
                        ₹{result.refund_amount?.toLocaleString() || '0'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {allotmentsArray.filter((item: any) => (item.refund_amount || 0) > 0).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No refunds to process</p>
                <p className="text-sm">All applicants received their full requested shares.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
