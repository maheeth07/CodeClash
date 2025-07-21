import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Trophy, Users, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CodeClash</span>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">CodeClash</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform where teachers create engaging coding contests and students showcase their programming
            skills. Join thousands of developers in the coding revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/register">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Competitive Coding</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Participate in exciting coding contests, solve challenging problems, and climb the leaderboards to prove
                your skills.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Teacher Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Create and manage contests with powerful tools. Design problems, track progress, and engage your
                students.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Real-time Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get instant feedback on submissions and track progress with live leaderboards and detailed analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Illustration */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-left mb-8 md:mb-0">
                  <h3 className="text-3xl font-bold mb-4">Ready to Code?</h3>
                  <p className="text-xl opacity-90 mb-6">
                    Join thousands of students and teachers already using CodeClash to enhance their coding journey.
                  </p>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/register">Join Now</Link>
                  </Button>
                </div>
                <div className="bg-white/10 rounded-lg p-8">
                  <Code className="h-24 w-24 text-white mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">CodeClash</span>
          </div>
          <p className="text-gray-400">© 2024 CodeClash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
