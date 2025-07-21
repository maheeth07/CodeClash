"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Code,
  Calendar,
  Clock,
  Trophy,
  LogOut,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export default function StudentDashboard() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  const studentId = "YOUR_STUDENT_ID"; // replace with actual student id or from context

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contestsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contests`
        );

        const contestsData = await contestsRes.json();
        setContests(contestsData);

        // You can add stats fetching here once backend supports it
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatus = (start: string, end: string) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "active";
    return "completed";
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    upcoming: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-200 text-gray-700",
  };

  if (loading) {
    return <p className="p-4">Loading dashboard…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              CodeClash
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Student Dashboard</span>
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Ready to take on some coding challenges?
          </p>
        </div>

        {/* Contests List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Contests</CardTitle>
            <CardDescription>
              Join contests and compete with other students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {contests.map((contest) => {
                const status = getStatus(contest.start_time, contest.end_time);
                return (
                  <Card
                    key={contest.id}
                    className="border-l-4 border-l-blue-500 hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {contest.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {contest.description}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status]}`}
                        >
                          {status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                contest.start_time
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(contest.end_time).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {status === "active" && (
                            <Button
                              className="bg-green-600 hover:bg-green-700 text-white"
                              asChild
                            >
                              <Link href={`/student/contest/${contest.id}`}>
                                Join Contest
                              </Link>
                            </Button>
                          )}
                          {status === "upcoming" && (
                            <Button
                              variant="outline"
                              className="border-yellow-400 text-yellow-700"
                              disabled
                            >
                              Starts Soon
                            </Button>
                          )}
                          {status === "completed" && (
                            <Button
                              variant="outline"
                              className="border-gray-400 text-gray-600"
                              asChild
                            >
                              <Link href={`/leaderboard/${contest.id}`}>
                                View Results
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
