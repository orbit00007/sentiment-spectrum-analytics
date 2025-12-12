import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { getDashboardUsers, DashboardUser } from "@/apiHelpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Calendar as CalendarIcon,
  ExternalLink,
  FileJson,
  Loader2,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfDay, endOfDay, isAfter, isBefore, parseISO } from "date-fns";

export default function Dashboard() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DashboardUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [dateFilterType, setDateFilterType] = useState<"created_at" | "updated_at" | "both">("created_at");
  const { toast } = useToast();

  // Fetch users function (reusable)
  const fetchUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const data = await getDashboardUsers();
      setUsers(data);
      setFilteredUsers(data);
      
      if (isRefresh) {
        toast({
          title: "Success",
          description: "Dashboard data refreshed successfully",
          duration: 2000,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard users:", error);
      const errorMessage = error?.message || "Failed to load dashboard data. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query and date range
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.product_website?.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((user) => {
        const fromDate = dateFrom ? startOfDay(dateFrom) : null;
        const toDate = dateTo ? endOfDay(dateTo) : null;

        if (dateFilterType === "created_at") {
          const createdDate = parseISO(user.created_at);
          return (
            (!fromDate || !isBefore(createdDate, fromDate)) &&
            (!toDate || !isAfter(createdDate, toDate))
          );
        }

        if (dateFilterType === "updated_at") {
          const updatedDate = parseISO(user.updated_at);
          return (
            (!fromDate || !isBefore(updatedDate, fromDate)) &&
            (!toDate || !isAfter(updatedDate, toDate))
          );
        }

        if (dateFilterType === "both") {
          const createdDate = parseISO(user.created_at);
          const updatedDate = parseISO(user.updated_at);
          
          const createdMatches =
            (!fromDate || !isBefore(createdDate, fromDate)) &&
            (!toDate || !isAfter(createdDate, toDate));
          
          const updatedMatches =
            (!fromDate || !isBefore(updatedDate, fromDate)) &&
            (!toDate || !isAfter(updatedDate, toDate));

          // For "both", either created_at OR updated_at must match
          return createdMatches || updatedMatches;
        }

        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [searchQuery, users, dateFrom, dateTo, dateFilterType]);

  // Format date to readable format (without year)
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to render boolean badge
  const renderBooleanBadge = (value: boolean | undefined) => {
    if (value === true) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
          <Check className="w-3 h-3 mr-1" />
          Yes
        </Badge>
      );
    } else if (value === false) {
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
          No
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">
          N/A
        </Badge>
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">
                    Users Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Comprehensive overview of all users and their analytics data
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers(true)}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-gradient border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold gradient-text mt-1">
                      {users.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-gradient border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Filtered Results
                    </p>
                    <p className="text-3xl font-bold gradient-text mt-1">
                      {filteredUsers.length}
                    </p>
                  </div>
                  <Search className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-gradient border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Keywords
                    </p>
                    <p className="text-3xl font-bold gradient-text mt-1">
                      {users.reduce(
                        (sum, user) => sum + (user.keywords_list?.length || 0),
                        0
                      )}
                    </p>
                  </div>
                  <FileJson className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <Card className="card-gradient border-0 shadow-elevated">
            <CardHeader>
              <CardTitle>User Data</CardTitle>
              <CardDescription>
                Search and filter users by name, email, website, or date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                {/* Search and Filters in One Line */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="Search by name, email, or website..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>

                  {/* Visual Separator */}
                  <div className="h-10 w-px bg-border flex-shrink-0" />

                  {/* Date Filter Type */}
                  <Select value={dateFilterType} onValueChange={(value: "created_at" | "updated_at" | "both") => setDateFilterType(value)}>
                    <SelectTrigger className="w-[140px] h-10 flex-shrink-0">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created</SelectItem>
                      <SelectItem value="updated_at">Updated</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* From Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-[160px] h-10 justify-start text-left font-normal flex-shrink-0 ${!dateFrom ? "text-muted-foreground" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "MMM d") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* To Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-[160px] h-10 justify-start text-left font-normal flex-shrink-0 ${!dateTo ? "text-muted-foreground" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "MMM d") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        disabled={(date) => dateFrom ? date < dateFrom : false}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Buttons */}
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                      className="flex-shrink-0 h-10 w-10 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  {(dateFrom || dateTo) && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setDateFrom(undefined);
                        setDateTo(undefined);
                      }}
                      className="flex items-center gap-1.5 flex-shrink-0 h-10 px-3"
                    >
                      <X className="h-4 w-4" />
                      <span className="text-xs">Clear</span>
                    </Button>
                  )}

                  {/* Active Filter Badge */}
                  {(dateFrom || dateTo) && (
                    <Badge variant="secondary" className="flex-shrink-0 text-xs h-10 flex items-center">
                      {dateFrom && dateTo
                        ? `${format(dateFrom, "MMM d")} - ${format(dateTo, "MMM d")}`
                        : dateFrom
                        ? `From ${format(dateFrom, "MMM d")}`
                        : `Until ${format(dateTo, "MMM d")}`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No users found</p>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "No user data available"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-center">User</TableHead>
                          <TableHead className="font-semibold text-center">Email</TableHead>
                          <TableHead className="font-semibold text-center">Website</TableHead>
                          <TableHead className="font-semibold text-center">
                            Keywords
                          </TableHead>
                          <TableHead className="font-semibold text-center">Created</TableHead>
                          <TableHead className="font-semibold text-center">Updated</TableHead>
                          <TableHead className="font-semibold text-center">
                            Results Generated
                          </TableHead>
                          <TableHead className="font-semibold text-center">
                            Analytics Generated
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((dashboardUser) => (
                          <TableRow
                            key={dashboardUser.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-medium text-center">
                              {dashboardUser.name || "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              <a
                                href={`mailto:${dashboardUser.email}`}
                                className="text-primary hover:underline"
                              >
                                {dashboardUser.email}
                              </a>
                            </TableCell>
                            <TableCell className="text-center">
                              {dashboardUser.product_website ? (
                                <a
                                  href={dashboardUser.product_website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center justify-center gap-1"
                                >
                                  {dashboardUser.product_website.length > 30
                                    ? `${dashboardUser.product_website.substring(0, 30)}...`
                                    : dashboardUser.product_website}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {dashboardUser.keywords_list && dashboardUser.keywords_list.length > 0 ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                      <Badge variant="secondary" className="hover:bg-secondary/80">
                                        {dashboardUser.keywords_list.length}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        keywords
                                      </span>
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80" align="start">
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <Search className="w-4 h-4 text-primary" />
                                        <h4 className="font-semibold text-sm">Keywords ({dashboardUser.keywords_list.length})</h4>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {dashboardUser.keywords_list.map((keyword: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {keyword}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <Badge variant="secondary">
                                    0
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    keywords
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {formatDate(dashboardUser.created_at)}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {formatDate(dashboardUser.updated_at)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderBooleanBadge(dashboardUser.results_generated)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderBooleanBadge(dashboardUser.analytics_generated)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

