"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Code, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddQuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      contest_id: params.id,
      title: formData.get("title"),
      description: formData.get("description"),
      sample_input: formData.get("sampleInput"),
      sample_output: formData.get("sampleOutput"),
      hidden_input: formData.get("hiddenInput"),
      hidden_output: formData.get("hiddenOutput"),
    }

    try {
      setLoading(true)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create question")
      }

      router.push(`/teacher/contest/${params.id}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
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
            <Link href={`/teacher/contest/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contest
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Create a new coding question for this contest</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title</Label>
                  <Input id="title" name="title" placeholder="Enter question title" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide detailed problem description"
                    rows={6}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sampleInput">Sample Input</Label>
                    <Textarea
                      id="sampleInput"
                      name="sampleInput"
                      placeholder="Provide sample input"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampleOutput">Sample Output</Label>
                    <Textarea
                      id="sampleOutput"
                      name="sampleOutput"
                      placeholder="Provide expected output"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hiddenInput">Hidden Test Input</Label>
                    <Textarea
                      id="hiddenInput"
                      name="hiddenInput"
                      placeholder="Hidden test case input"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hiddenOutput">Hidden Test Output</Label>
                    <Textarea
                      id="hiddenOutput"
                      name="hiddenOutput"
                      placeholder="Expected output for hidden test"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Saving…" : "Save Question"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/teacher/contest/${params.id}`}>Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
