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
import { Badge } from "@/components/ui/badge";
import { Code, ArrowLeft, Plus, Eye } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  title: string;
  description: string;
  sample_input: string;
  sample_output: string;
  created_at: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
}

export default function ContestDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contests/${params.id}`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch contest details");
        }
        const data = await res.json();
        setContest(data.contest);
        setQuestions(data.questions || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchContestDetails();
  }, [params.id]);

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    setDeleting(questionId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${questionId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete question");
      }

      setQuestions((prev) => prev.filter((q) => q.id !== questionId));

      alert("Question deleted successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <p className="p-4">Loading contest details…</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  if (!contest) {
    return <p className="p-4">Contest not found.</p>;
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
        {/* Contest Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{contest.title}</CardTitle>
                <CardDescription className="mt-2">
                  {contest.description}
                </CardDescription>
              </div>
              <Badge className="text-sm">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-medium">{contest.start_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-medium">{contest.end_time}</p>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <Button asChild>
                <Link href={`/leaderboard/${contest.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/teacher/contest/${contest.id}/submissions`}>
                  View Submissions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contest Questions</CardTitle>
                <CardDescription>
                  Manage questions for this contest
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/teacher/contest/${contest.id}/add-question`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p>No questions added yet.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{question.title}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Created:{" "}
                          {new Date(question.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting === question.id}
                        onClick={() => handleDelete(question.id)}
                      >
                        {deleting === question.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
