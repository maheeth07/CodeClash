"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Code, ArrowLeft, Trophy, Medal, Award } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Participant {
  student_id: string
  name?: string
  total_score: number
  solved?: number
  time?: string
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2: return <Medal className="h-5 w-5 text-gray-400" />
    case 3: return <Award className="h-5 w-5 text-amber-600" />
    default: return <span className="text-lg font-bold">#{rank}</span>
  }
}

export default function LeaderboardPage() {
  const { id: contestId } = useParams<{ id: string }>()
  const [leaderboard, setLeaderboard] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leaderboard/${contestId}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setLeaderboard(data)
        } else {
          console.error("API did not return an array:", data)
          setLeaderboard([])
          setError("Invalid leaderboard data.")
        }
      } catch (err) {
        console.error(err)
        setError("Failed to fetch leaderboard.")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [contestId])

  if (loading) return <p className="p-4">Loading leaderboard…</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-gray-50">
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
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Contest Leaderboard</CardTitle>
            <CardDescription>See how everyone performed!</CardDescription>
          </CardHeader>
        </Card>

        {leaderboard.length >= 3 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">🏆 Top Performers 🏆</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {leaderboard.slice(0, 3).map((participant, index) => (
                  <Card
                    key={participant.student_id}
                    className={`text-center ${
                      index === 0
                        ? "border-yellow-200 bg-yellow-50"
                        : index === 1
                          ? "border-gray-200 bg-gray-50"
                          : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">{getRankIcon(index + 1)}</div>
                      <h3 className="font-bold text-lg">{participant.name || participant.student_id}</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{participant.total_score} pts</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {participant.solved || "-"} problems • {participant.time || "-"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Complete Rankings</CardTitle>
            <CardDescription>All participants and their scores</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Problems Solved</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((participant, index) => (
                  <TableRow
                    key={participant.student_id}
                    className={index < 3 ? "bg-gradient-to-r from-blue-50 to-purple-50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">{getRankIcon(index + 1)}</div>
                    </TableCell>
                    <TableCell className="font-medium">{participant.name || participant.student_id}</TableCell>
                    <TableCell className="text-center">{participant.solved || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{participant.total_score}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{participant.time || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
