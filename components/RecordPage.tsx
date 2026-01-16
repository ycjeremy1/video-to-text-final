"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("auto")
  const [extractKeyPoints, setExtractKeyPoints] = useState(false)
  const [generateNotes, setGenerateNotes] = useState(false)
  const [keyPoints, setKeyPoints] = useState("")
  const [classNotes, setClassNotes] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError("Unable to access microphone. Please check permission settings.")
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        intervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioRef.current && audioBlob) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setIsTranscribing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "recording.wav")
      formData.append("language", selectedLanguage)
      formData.append("extractKeyPoints", extractKeyPoints.toString())
      formData.append("generateNotes", generateNotes.toString())

      // Simulate API
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulated result
      setTranscription("This is a simulated transcription result. In a real app, the actual speech-to-text content will be shown here.")

      if (extractKeyPoints) {
        setKeyPoints("• Key 1: This is the first extracted key point\n• Key 2: This is the second extracted key point\n• Key 3: This is the third extracted key point")
      }

      if (generateNotes) {
        setClassNotes(
          "# Class Notes\n\n## Main Content\n1. First point\n2. Second point\n3. Third point\n\n## Summary\nThis is a summary of the class content.",
        )
      }
    } catch (err) {
      setError("Transcription failed. Please try again.")
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const downloadTranscription = () => {
    if (!transcription) return

    const blob = new Blob([transcription], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "recording-transcription.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Voice Recording</h1>
        <p className="text-lg text-gray-600">Record speech and convert it to text</p>
      </div>

      {/* Recording controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Recording Controls
          </CardTitle>
          <CardDescription>Click to start recording. Pause and resume are supported.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select transcription language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extract-keypoints">Smart Analysis</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch id="extract-keypoints" checked={extractKeyPoints} onCheckedChange={setExtractKeyPoints} />
                  <Label htmlFor="extract-keypoints" className="text-sm text-gray-600">
                    Extract key points
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generate-notes">Generate Notes</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch id="generate-notes" checked={generateNotes} onCheckedChange={setGenerateNotes} />
                  <Label htmlFor="generate-notes" className="text-sm text-gray-600">
                    Generate class notes
                  </Label>
                </div>
              </div>
            </div>

            {/* Recording UI */}
            <div className="text-center space-y-6">
              <div className="text-6xl font-mono text-gray-900">{formatTime(recordingTime)}</div>

              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg"
                  >
                    <Mic className="h-6 w-6 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button onClick={pauseRecording} variant="outline" size="lg" className="px-8 py-4 text-lg">
                      {isPaused ? <Play className="h-6 w-6 mr-2" /> : <Pause className="h-6 w-6 mr-2" />}
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button onClick={stopRecording} variant="destructive" size="lg" className="px-8 py-4 text-lg">
                      <Square className="h-6 w-6 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>

              {isRecording && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{isPaused ? "Recording paused" : "Recording..."}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Playback */}
            {audioBlob && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Playback</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={playRecording}>
                      {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={transcribeAudio} disabled={isTranscribing}>
                      {isTranscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Transcribing...
                        </>
                      ) : (
                        "Start Transcription"
                      )}
                    </Button>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioBlob ? URL.createObjectURL(audioBlob) : undefined}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcription result */}
      {transcription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transcription Result</CardTitle>
                <CardDescription>Recording transcription completed</CardDescription>
              </div>
              <Button onClick={downloadTranscription} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Text
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {keyPoints && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{keyPoints}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Notes */}
      {classNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Class Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{classNotes}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
