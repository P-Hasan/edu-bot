"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Brain, Calculator, Globe, History, Code, Send, Sparkles } from "lucide-react"

// Type definitions
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type Subject = {
  name: string
  icon: React.ElementType
  color: string
}

// Define subjects and quick questions for the UI
const subjects: Subject[] = [
  { name: "Math", icon: Calculator, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { name: "Science", icon: Brain, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { name: "History", icon: History, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { name: "Geography", icon: Globe, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { name: "English", icon: BookOpen, color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
  {
    name: "Computer Science",
    icon: Code,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  },
]

const quickQuestions: string[] = [
  "Explain photosynthesis in simple terms",
  "How do I solve quadratic equations?",
  "What caused World War I?",
  "Explain the water cycle",
]

export default function EduBot() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm EduBot, your AI study buddy! 🤖 I can help you with a variety of subjects. To get started, you can either select a subject below or ask a quick question.",
    },
  ])
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Use a DOM ref to the scrollable container
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  // Autoscroll to the bottom of the chat
  useEffect(() => {
    const el = scrollAreaRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
    setInput("")
  }

  // Send message to AI
  const sendMessage = async (messageContent: string) => {
    const trimmed = (messageContent || "").trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""

    if (!apiKey) {
      const helpMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "No API key found. Please add your Gemini API key to NEXT_PUBLIC_GEMINI_API_KEY or set the `apiKey` variable before trying to call the model.",
      }
      setMessages((prev) => [...prev, helpMessage])
      setIsLoading(false)
      return
    }

const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt =
      "You are EduBot, an AI-powered study companion. Provide clear, concise, and helpful explanations for educational topics. Respond in a friendly and encouraging tone."

    const chatHistory = messages.map((msg) => ({ role: msg.role, parts: [{ text: msg.content }] }))

    const payload = {
  contents: [
    {
      role: "user",
      parts: [
        { text: "You are EduBot, a friendly AI tutor that helps students learn different subjects like Math, Science, Programming, Business, and Design. Keep explanations simple and clear." },
        { text: trimmed }
      ]
    }
  ]
};


    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP Error! Status: ${response.status} - ${text}`)
      }

      const result = await response.json()
      const assistantText =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't get a response from the AI. Please try again."

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantText,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error fetching AI response:", error)
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle quick question clicks
  const handleQuickQuestion = (question: string) => {
    setInput(question)
    sendMessage(question)
  }

  // Handle subject button clicks
  const handleSubjectClick = (subjectName: string) => {
    setSelectedSubject(subjectName)
    const message = `I'd like to learn about ${subjectName}. Can you help me with this subject?`
    sendMessage(message)
  }

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            EduBot
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered study companion for step-by-step learning across all subjects
        </p>
      </div>

      {/* Subject Selection */}
      {messages.length <= 1 && (
        <Card className="mb-6 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Choose a Subject to Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const Icon = subject.icon
                return (
                  <Button
                    key={subject.name}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 rounded-xl transition-transform duration-200 hover:scale-105 hover:shadow-md"
                    onClick={() => handleSubjectClick(subject.name)}
                  >
                    <div className={`p-2 rounded-lg ${subject.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium">{subject.name}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <Card className="mb-6 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Or Try These Quick Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 rounded-full font-normal shadow"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col rounded-xl shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">EduBot is ready to help</span>
            {selectedSubject && (
              <Badge variant="outline" className="ml-auto rounded-full">
                {selectedSubject}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">

          {/* Messages */}
          <div className="flex-1 pr-4 overflow-auto" ref={scrollAreaRef}>
            <div className="space-y-4 p-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-xl ${
                      message.role === "user"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-muted text-foreground shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <span className="text-sm text-muted-foreground ml-2">
                        EduBot is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 rounded-xl"
              disabled={isLoading}
              aria-label="Ask EduBot"
            />
            <Button type="submit" disabled={isLoading || !input}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>
          EduBot provides educational assistance. Always verify important
          information with your teachers or textbooks.
        </p>
      </div>
    </div>
  </div>
)
}