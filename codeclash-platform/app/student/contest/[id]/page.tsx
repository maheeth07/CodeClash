"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, ArrowLeft, Play, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Contest {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
}

interface Question {
  id: string
  title: string
  description: string
  difficulty?: string
  points?: number
  solved?: boolean
}

export default function StudentContestPage() {
  const params = useParams()
  const contestId = params.id as string

  const [contest, setContest] = useState<Contest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/contest/${contestId}`)
        const data = await res.json()
        setContest(data.contest)
        setQuestions(data.questions)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [contestId])

  if (loading) return <p className="p-4">Loading contest…</p>
  if (!contest) return <p className="p-4">Contest not found</p>

  const getStatus = () => {
    const now = new Date()
    const start = new Date(contest.start_time)
    const end = new Date(contest.end_time)

    if (now < start) return "upcoming"
    if (now >= start && now <= end) return "active"
    return "completed"
  }

  const status = getStatus()

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
            <Link href="/student/dashboard">
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
                <CardDescription className="mt-2">{contest.description}</CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-medium">{new Date(contest.start_time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-medium">{new Date(contest.end_time).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Problems</CardTitle>
            <CardDescription>Solve the problems to earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {question.solved ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                        )}
                        <div>
                          <h3 className="font-medium text-lg">{question.title}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            {question.difficulty && (
                              <Badge variant="outline">{question.difficulty}</Badge>
                            )}
                            {question.points && (
                              <span className="text-sm text-gray-600">{question.points} points</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/student/contest/${contest.id}/problem/${question.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          {question.solved ? "View Solution" : "Solve"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
