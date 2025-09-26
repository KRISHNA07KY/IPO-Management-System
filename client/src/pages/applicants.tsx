import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Users, FileText } from "lucide-react";
import { useState } from "react";

export default function Applicants() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const applicationsArray = Array.isArray(applications) ? applications : [];
  const filteredApplications = applicationsArray.filter((app: any) =>
    app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.demat_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 ml-64 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-64 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Applicants</h2>
            <p className="text-muted-foreground mt-1">Manage and view all IPO applicants</p>
          </div>
          <Button variant="outline" data-testid="button-export-applicants">
            <Download className="mr-2 h-4 w-4" />
            Export Applicants
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                <Users className="text-chart-1 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Applicants</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-applicants">
                  {applicationsArray.length}
                </p>
                <p className="text-chart-1 text-sm font-medium">Active applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center">
                <FileText className="text-chart-2 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Shares Requested</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-shares-requested">
                  {applicationsArray.reduce((sum: number, app: any) => sum + app.shares_req, 0).toLocaleString()}
                </p>
                <p className="text-chart-2 text-sm font-medium">All applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
                <Download className="text-chart-3 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Application Value</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="text-application-value">
                  ₹{applicationsArray.reduce((sum: number, app: any) => sum + app.amount, 0).toLocaleString()}
                </p>
                <p className="text-chart-3 text-sm font-medium">Total applied amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Applicants</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Details</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Demat No</TableHead>
                  <TableHead className="text-right">Shares Requested</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Shares Allotted</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app: any) => (
                  <TableRow key={app.id} className="hover:bg-muted transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-chart-1/10 rounded-full flex items-center justify-center">
                          <Users className="text-chart-1 h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{app.applicant_name}</p>
                          <p className="text-xs text-muted-foreground">Application #{app.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{app.pan}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{app.demat_no}</TableCell>
                    <TableCell className="text-right font-medium text-card-foreground">{app.shares_req}</TableCell>
                    <TableCell className="text-right text-card-foreground">₹{app.amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-chart-2">
                      {app.shares_alloted || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={
                        app.shares_alloted 
                          ? "bg-chart-2/10 text-chart-2" 
                          : "bg-chart-3/10 text-chart-3"
                      }>
                        {app.shares_alloted ? "Allotted" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No applicants found matching your search." : "No applicants yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}