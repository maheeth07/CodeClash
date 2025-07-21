"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Code, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Editor from "@monaco-editor/react"

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  points: number
  sampleInput: string
  sampleOutput: string
  starterCode?: string
}

const languageMap: Record<string, { id: number; monacoLang: string; template: string }> = {
  javascript: {
    id: 63,
    monacoLang: "javascript",
    template: `// Write your JavaScript solution here
function main() {
  console.log("Hello, World!");
}
main();`
  },
  python: {
    id: 71,
    monacoLang: "python",
    template: `# Write your Python solution here
def main():
    print("Hello, World!")

main()`
  },
  java: {
    id: 62,
    monacoLang: "java",
    template: `// Write your Java solution here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
  },
  cpp: {
    id: 54,
    monacoLang: "cpp",
    template: `// Write your C++ solution here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
  }
}

export default function CodeEditorPage() {
  const params = useParams()
  const { id: contestId, problemId } = params as { id: string; problemId: string }

  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<keyof typeof languageMap>("javascript")
  const [code, setCode] = useState(languageMap.javascript.template)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem("student_id")
    if (!id) {
      alert("You are not logged in. Please log in first.")
    }
    setStudentId(id)

    const fetchProblem = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/question/${problemId}`
        )
        const data = await res.json()
        setProblem(data)
        if (data.starterCode) {
          setCode(data.starterCode)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [problemId])

  const handleLanguageChange = (lang: keyof typeof languageMap) => {
    setLanguage(lang)
    setCode(languageMap[lang].template)
  }

  const handleSubmit = async () => {
  if (!studentId) {
    alert("Student not logged in!")
    return
  }

  if (!problem) {
    alert("Problem not loaded!")
    return
  }

  setSubmitting(true)
  setOutput(null)

  const language_id = languageMap[language].id

  const payload = {
    student_id: studentId,
    contest_id: contestId,
    question_id: problemId,
    code,
    language_id,
    input: problem.sampleInput,
    expected_output: problem.sampleOutput
  }

  // 🚀 ADD THIS:
  console.log("🚀 Payload being sent to backend:", payload)

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/submit-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (data.error) {
      setOutput(`❌ Error: ${data.error}`)
    } else {
      setOutput(
        `✅ Status: ${data.judge0_result.status.description}\n\nOutput:\n${data.judge0_result.stdout || "(no output)"}`
      )
    }

  } catch (err) {
    console.error(err)
    setOutput("❌ Failed to submit code.")
  } finally {
    setSubmitting(false)
  }
}


  if (loading) return <p className="p-4">Loading problem…</p>
  if (!problem) return <p className="p-4">Problem not found</p>

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
            <Link href={`/student/contest/${contestId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contest
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{problem.difficulty}</Badge>
                    <Badge>{problem.points} pts</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{problem.description}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Input/Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Input:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{problem.sampleInput}</pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Output:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{problem.sampleOutput}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Editor
                  height="400px"
                  defaultLanguage={languageMap[language].monacoLang}
                  language={languageMap[language].monacoLang}
                  value={code}
                  theme="vs-dark"
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {submitting ? "Submitting…" : "Submit Solution"}
              </Button>
            </div>

            {output && (
              <Card>
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">{output}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
