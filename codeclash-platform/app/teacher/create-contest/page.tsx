"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, ArrowLeft } from "lucide-react";

export default function CreateContestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // optional: check if user is teacher when page loads
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (!userId || role !== "teacher") {
      setError("You must be logged in as a teacher to create contests.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("contestName")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const start_time_raw = formData.get("startTime")?.toString();
    const end_time_raw = formData.get("endTime")?.toString();

    if (!title || !description || !start_time_raw || !end_time_raw) {
      setError("Please fill in all the fields.");
      setLoading(false);
      return;
    }

    const teacher_id = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (!teacher_id || role !== "teacher") {
      setError("You must be logged in as a teacher to create contests.");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      start_time: new Date(start_time_raw).toISOString(),
      end_time: new Date(end_time_raw).toISOString(),
      teacher_id,
    };

    console.log("Creating contest with:", payload);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create contest");
      }

      router.push("/teacher/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
          <Button variant="outline" asChild>
            <Link href="/teacher/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Contest</CardTitle>
              <CardDescription>Set up a new coding contest for your students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-red-500">{error}</p>}

                <div className="space-y-2">
                  <Label htmlFor="contestName">Contest Name</Label>
                  <Input
                    id="contestName"
                    name="contestName"
                    placeholder="Enter contest name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the contest objectives and rules"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Contest"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/teacher/dashboard">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
