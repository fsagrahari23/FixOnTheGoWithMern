import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Wrench, Users, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Mechanic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [pendingMechanics, setPendingMechanics] = useState([]);
  const [approvedMechanics, setApprovedMechanics] = useState([]);
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [displayedMechanics, setDisplayedMechanics] = useState([]);

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [selectedPendingMechanic, setSelectedPendingMechanic] = useState(null);

  const applyFilters = () => {
    const filtered = approvedMechanics.filter((mechanic) => {
      const searchMatch =
        !search ||
        mechanic.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        mechanic.user?.email.toLowerCase().includes(search.toLowerCase());
      const availabilityMatch =
        availabilityFilter === "all" ||
        (mechanic.availability ? "available" : "unavailable") ===
          availabilityFilter;
      const specializationMatch =
        specializationFilter === "all" ||
        (mechanic.specialization &&
          mechanic.specialization.includes(specializationFilter));
      const experience = mechanic.experience || 0;
      let experienceMatch = true;
      if (experienceFilter === "0-2")
        experienceMatch = experience >= 0 && experience <= 2;
      else if (experienceFilter === "3-5")
        experienceMatch = experience >= 3 && experience <= 5;
      else if (experienceFilter === "6-10")
        experienceMatch = experience >= 6 && experience <= 10;
      else if (experienceFilter === "10+") experienceMatch = experience > 10;
      const rating = mechanic.rating || 0;
      let ratingMatch = true;
      if (ratingFilter === "4+") ratingMatch = rating >= 4;
      else if (ratingFilter === "3+") ratingMatch = rating >= 3;
      else if (ratingFilter === "2+") ratingMatch = rating >= 2;
      else if (ratingFilter === "1+") ratingMatch = rating >= 1;
      return (
        searchMatch &&
        availabilityMatch &&
        specializationMatch &&
        experienceMatch &&
        ratingMatch
      );
    });
    setDisplayedMechanics(filtered);
  };

  // Initialize displayed mechanics when data loads
  useEffect(() => {
    if (approvedMechanics.length > 0) {
      setDisplayedMechanics(approvedMechanics);
    }
  }, [approvedMechanics]);

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/api/mechanics`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch mechanics");
      }
      const data = await response.json();
      setMechanics(data.mechanics || []);
      setPendingMechanics(data.pendingMechanics || []);
      setApprovedMechanics(data.approvedMechanics || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/mechanic/${id}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to approve mechanic");
      }
      await fetchMechanics();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/mechanic/${id}/reject`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to reject mechanic");
      }
      await fetchMechanics();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/mechanic/${id}/delete`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete mechanic");
      }
      await fetchMechanics();
    } catch (err) {
      setError(err.message);
    }
  };

  // Initialize displayed mechanics when data loads
  useEffect(() => {
    if (approvedMechanics.length > 0) {
      setDisplayedMechanics(approvedMechanics);
    }
  }, [approvedMechanics]);

  // Chart data
  const specializationData = {};
  approvedMechanics.forEach((m) => {
    if (m.specialization) {
      m.specialization.forEach((spec) => {
        specializationData[spec] = (specializationData[spec] || 0) + 1;
      });
    }
  });
  const specializationChartData = Object.entries(specializationData).map(
    ([name, value]) => ({ name, value })
  );

  const experienceData = { "0-2": 0, "3-5": 0, "6-10": 0, "10+": 0 };
  approvedMechanics.forEach((m) => {
    const exp = m.experience || 0;
    if (exp <= 2) experienceData["0-2"]++;
    else if (exp <= 5) experienceData["3-5"]++;
    else if (exp <= 10) experienceData["6-10"]++;
    else experienceData["10+"]++;
  });
  const experienceChartData = Object.entries(experienceData).map(
    ([name, value]) => ({ name: name + " years", value })
  );

  const COLORS = [
    "#4361ee",
    "#38b000",
    "#f8961e",
    "#4cc9f0",
    "#ef476f",
    "#ff6b6b",
  ];

  return (
    <div className="container py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manage Mechanics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Mechanics</h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      {error && (
        <p className="text-red-600 bg-red-50 p-4 rounded-lg">Error: {error}</p>
      )}

      {!loading && !error && (
        <>
          {pendingMechanics.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50/50">
              <CardHeader className="bg-orange-500/10 border-b border-orange-200 py-3">
                <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
                  <Clock className="w-5 h-5" />
                  Pending Approvals ({pendingMechanics.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMechanics.map((mechanic) => (
                      <TableRow key={mechanic._id}>
                        <TableCell className="font-medium">
                          {mechanic.user?.name}
                        </TableCell>
                        <TableCell>{mechanic.user?.email}</TableCell>
                        <TableCell>{mechanic.user?.phone}</TableCell>
                        <TableCell>{mechanic.experience} years</TableCell>
                        <TableCell>
                          {mechanic.specialization?.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="mr-1">
                              {spec}
                            </Badge>
                          ))}
                          {mechanic.specialization?.length > 2 && (
                            <Badge variant="outline">
                              +{mechanic.specialization.length - 2}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(mechanic.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => navigate(`/admin/mechanic/${mechanic.user._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setSelectedPendingMechanic(mechanic);
                              setApproveDialogOpen(true);
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedPendingMechanic(mechanic);
                              setRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader className="bg-blue-500/10 border-b border-blue-200 py-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                <Users className="w-5 h-5" />
                Filter Mechanics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Search
                  </label>
                  <Input
                    placeholder="Search mechanics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Availability
                  </label>
                  <Select
                    value={availabilityFilter}
                    onValueChange={setAvailabilityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Specialization
                  </label>
                  <Select
                    value={specializationFilter}
                    onValueChange={setSpecializationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      <SelectItem value="Engine Repair">Engine Repair</SelectItem>
                      <SelectItem value="Brake Systems">Brake Systems</SelectItem>
                      <SelectItem value="Electrical Systems">
                        Electrical Systems
                      </SelectItem>
                      <SelectItem value="Transmission">Transmission</SelectItem>
                      <SelectItem value="Tire Services">Tire Services</SelectItem>
                      <SelectItem value="Battery Services">Battery Services</SelectItem>
                      <SelectItem value="General Maintenance">
                        General Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Experience
                  </label>
                  <Select
                    value={experienceFilter}
                    onValueChange={setExperienceFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experience</SelectItem>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Rating
                  </label>
                  <Select
                    value={ratingFilter}
                    onValueChange={setRatingFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4+">4+ Stars</SelectItem>
                      <SelectItem value="3+">3+ Stars</SelectItem>
                      <SelectItem value="2+">2+ Stars</SelectItem>
                      <SelectItem value="1+">1+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="default" size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-green-500/10 border-b border-green-200 py-3">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                <Wrench className="w-5 h-5" />
                Approved Mechanics ({displayedMechanics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedMechanics.map((mechanic) => (
                    <TableRow key={mechanic._id}>
                      <TableCell className="font-medium">
                        {mechanic.user?.name}
                      </TableCell>
                      <TableCell>{mechanic.user?.email}</TableCell>
                      <TableCell>{mechanic.user?.phone}</TableCell>
                      <TableCell>{mechanic.experience} years</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.round(mechanic.rating || 0)
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1">({mechanic.rating || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mechanic.availability ? "default" : "destructive"
                          }
                        >
                          {mechanic.availability ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{mechanic.jobCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => navigate(`/admin/mechanic/${mechanic.user._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedMechanic(mechanic);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="bg-cyan-500/10 border-b border-cyan-200 py-3">
                <CardTitle className="flex items-center gap-2 text-cyan-800 text-lg">
                  <Wrench className="w-5 h-5" />
                  Mechanics by Specialization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={specializationChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {specializationChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-purple-500/10 border-b border-purple-200 py-3">
                <CardTitle className="flex items-center gap-2 text-purple-800 text-lg">
                  <Wrench className="w-5 h-5" />
                  Mechanics by Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={experienceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4361ee" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Mechanic</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{" "}
              {selectedPendingMechanic?.user?.name}? This will give them access to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button
              variant="default"
              onClick={() => {
                if (selectedPendingMechanic) {
                  handleApprove(selectedPendingMechanic.user._id);
                }
                setApproveDialogOpen(false);
                setSelectedPendingMechanic(null);
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Mechanic</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject{" "}
              {selectedPendingMechanic?.user?.name}? This will permanently delete their application and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedPendingMechanic) {
                  handleReject(selectedPendingMechanic.user._id);
                }
                setRejectDialogOpen(false);
                setSelectedPendingMechanic(null);
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mechanic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {selectedMechanic?.user?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMechanic) {
                  handleDelete(selectedMechanic.user._id);
                }
                setDeleteDialogOpen(false);
                setSelectedMechanic(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
