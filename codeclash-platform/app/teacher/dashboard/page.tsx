"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Code, Plus, Eye, LogOut, BarChart3, Users } from "lucide-react"
import Link from "next/link"

interface Contest {
  id: string
  title: string
  start_time: string
  end_time: string
  participants: number
  status: "active" | "completed" | "upcoming"
}

export default function TeacherDashboard() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
  const fetchContests = async () => {
    const teacherId = localStorage.getItem("user_id");

    if (!teacherId) {
      setError("No teacher ID found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contests?teacher_id=${teacherId}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch contests");
      }

      const data = await res.json();
      setContests(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  fetchContests();
}, []);

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CodeClash</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Teacher Dashboard</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Teacher!</h1>
          <p className="text-gray-600">Manage your coding contests and track student progress</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contests.length}</div>
              <p className="text-xs text-muted-foreground">All time created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contests.filter(c => c.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contests.reduce((sum, c) => sum + (c.participants || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all contests</p>
            </CardContent>
          </Card>
        </div>

        {/* Contests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Contests</CardTitle>
                <CardDescription>Manage your coding contests</CardDescription>
              </div>
              <Button asChild>
                <Link href="/teacher/create-contest">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Contest
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {contests.length === 0 ? (
              <p className="text-center text-gray-500">No contests found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contest Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contests.map(contest => (
                    <TableRow key={contest.id}>
                      <TableCell className="font-medium">{contest.title}</TableCell>
                      <TableCell>{contest.start_time}</TableCell>
                      <TableCell>{contest.end_time}</TableCell>
                      <TableCell>{contest.participants || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contest.status === "active"
                              ? "default"
                              : contest.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {contest.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/teacher/contest/${contest.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/leaderboard/${contest.id}`}>Leaderboard</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
