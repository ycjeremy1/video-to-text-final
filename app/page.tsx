"use client"

import type React from "react"
import RecordPage from "@/components/RecordPage" // Import RecordPage component

import { useState, useRef } from "react"
import { Upload, FileVideo, Download, Loader2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SpeechRecognition() {
  const [file, setFile] = useState<File | null>(null)
  const [currentView, setCurrentView] = useState<"home" | "import" | "record" | "upload" | "channel" | "dm" | "folder">(
    "home",
  )
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcription, setTranscription] = useState("")
  const [error, setError] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("auto")
  const [extractKeyPoints, setExtractKeyPoints] = useState(false)
  const [keyPoints, setKeyPoints] = useState("")
  const [isExtractingKeyPoints, setIsExtractingKeyPoints] = useState(false)
  const [historyRecords, setHistoryRecords] = useState([
    {
      id: 1,
      title: "会议记录 - 产品讨论",
      date: "2024-01-15",
      time: "14:30",
      duration: "25:30",
      type: "录音",
      preview: "今天我们讨论了新产品的功能规划，包括用户界面设计、核心功能模块...",
    },
    {
      id: 2,
      title: "英语学习视频转录",
      date: "2024-01-14",
      time: "09:15",
      duration: "12:45",
      type: "导入",
      preview: "Hello everyone, welcome to today's English lesson. We will be covering...",
    },
    {
      id: 3,
      title: "客户访谈记录",
      date: "2024-01-13",
      time: "16:20",
      duration: "18:22",
      type: "录音",
      preview: "感谢您接受我们的访谈。首先想了解一下您对我们产品的整体印象...",
    },
    {
      id: 4,
      title: "技术分享会议",
      date: "2024-01-12",
      time: "10:00",
      duration: "45:15",
      type: "导入",
      preview: "今天分享的主题是关于人工智能在语音识别领域的最新进展...",
    },
  ])

  const [classNotes, setClassNotes] = useState("")
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const [generateNotes, setGenerateNotes] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChannelsCollapsed, setIsChannelsCollapsed] = useState(false)
  const [isDirectMessagesCollapsed, setIsDirectMessagesCollapsed] = useState(false)
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false)

  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [selectedDM, setSelectedDM] = useState<string>("")
  const [selectedFolder, setSelectedFolder] = useState<string>("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // 检查文件类型
      if (selectedFile.type.startsWith("video/") || selectedFile.type.startsWith("audio/")) {
        setFile(selectedFile)
        setError("")
        setTranscription("")
      } else {
        setError("请选择视频或音频文件")
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.type.startsWith("video/") || droppedFile.type.startsWith("audio/")) {
        setFile(droppedFile)
        setError("")
        setTranscription("")
      } else {
        setError("请选择视频或音频文件")
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError("")
    setKeyPoints("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("language", selectedLanguage)
      formData.append("extractKeyPoints", extractKeyPoints.toString())
      formData.append("generateNotes", generateNotes.toString())

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("转录失败")
      }

      const result = await response.json()
      setTranscription(result.transcription)

      if (result.keyPoints) {
        setKeyPoints(result.keyPoints)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "转录过程中出现错误")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDownload = () => {
    if (!transcription) return

    const blob = new Blob([transcription], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file?.name.split(".")[0] || "transcription"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleAudioPlayback = () => {
    if (!file || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const generateClassNotes = async () => {
    if (!transcription) return

    setIsGeneratingNotes(true)
    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcription: transcription,
        }),
      })

      if (!response.ok) {
        throw new Error("生成笔记失败")
      }

      const result = await response.json()
      setClassNotes(result.notes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成笔记过程中出现错误")
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  // 根据不同文件夹显示不同的转录文件
  const getFolderFiles = (folderName: string) => {
    const baseFiles = {
      工作文档: [
        {
          name: "产品规划会议录音.mp3",
          size: "15.2 MB",
          type: "audio",
          date: "2024-01-15",
          duration: "25:30",
          source: "录音",
          preview: "今天我们讨论了新产品的功能规划，包括用户界面设计、核心功能模块...",
        },
        {
          name: "客户需求分析访谈.wav",
          size: "45.8 MB",
          type: "audio",
          date: "2024-01-14",
          duration: "18:22",
          source: "录音",
          preview: "感谢您接受我们的访谈。首先想了解一下您对我们产品的整体印象...",
        },
        {
          name: "团队周会记录.aac",
          size: "12.3 MB",
          type: "audio",
          date: "2024-01-13",
          duration: "32:15",
          source: "录音",
          preview: "本周工作总结和下周计划安排，各部门进展汇报...",
        },
        {
          name: "项目启动会议.mp4",
          size: "156.7 MB",
          type: "video",
          date: "2024-01-12",
          duration: "45:15",
          source: "导入",
          preview: "项目启动会议，讨论项目目标、时间安排和资源分配...",
        },
        {
          name: "季度总结会议.mkv",
          size: "234.5 MB",
          type: "video",
          date: "2024-01-11",
          duration: "38:45",
          source: "导入",
          preview: "季度工作总结，各部门成果汇报和下季度规划讨论...",
        },
      ],
      个人笔记: [
        {
          name: "英语学习课程.mp4",
          size: "89.3 MB",
          type: "video",
          date: "2024-01-14",
          duration: "12:45",
          source: "导入",
          preview: "Hello everyone, welcome to today's English lesson. We will be covering...",
        },
        {
          name: "读书笔记录音.flac",
          size: "67.2 MB",
          type: "audio",
          date: "2024-01-13",
          duration: "15:30",
          source: "录音",
          preview: "今天读了关于人工智能的书籍，记录一些重要的观点和思考...",
        },
        {
          name: "学习心得分享.ogg",
          size: "8.9 MB",
          type: "audio",
          date: "2024-01-12",
          duration: "20:15",
          source: "录音",
          preview: "最近学习的新技术总结，包括实践经验和遇到的问题...",
        },
        {
          name: "在线课程录屏.avi",
          size: "445.8 MB",
          type: "video",
          date: "2024-01-11",
          duration: "55:20",
          source: "导入",
          preview: "在线编程课程录屏，包含代码演示和讲解内容...",
        },
      ],
      项目资料: [
        {
          name: "技术分享会议.mov",
          size: "178.4 MB",
          type: "video",
          date: "2024-01-12",
          duration: "45:15",
          source: "导入",
          preview: "今天分享的主题是关于人工智能在语音识别领域的最新进展...",
        },
        {
          name: "需求评审会议.mp3",
          size: "22.1 MB",
          type: "audio",
          date: "2024-01-11",
          duration: "35:40",
          source: "录音",
          preview: "产品需求评审，讨论功能优先级和技术实现方案...",
        },
        {
          name: "架构设计讨论.wav",
          size: "78.6 MB",
          type: "audio",
          date: "2024-01-10",
          duration: "28:30",
          source: "录音",
          preview: "系统架构设计方案讨论，包括技术选型和性能考虑...",
        },
        {
          name: "用户调研访谈.wmv",
          size: "267.3 MB",
          type: "video",
          date: "2024-01-09",
          duration: "52:20",
          source: "导入",
          preview: "用户调研访谈，了解用户需求和使用习惯...",
        },
      ],
      会议记录: [
        {
          name: "月度例会录音.aac",
          size: "18.7 MB",
          type: "audio",
          date: "2024-01-15",
          duration: "42:30",
          source: "录音",
          preview: "月度工作总结和下月计划，各部门汇报进展情况...",
        },
        {
          name: "董事会会议.flac",
          size: "156.9 MB",
          type: "audio",
          date: "2024-01-10",
          duration: "65:15",
          source: "录音",
          preview: "董事会季度会议，讨论公司发展战略和重要决策...",
        },
        {
          name: "部门协调会议.mp3",
          size: "14.8 MB",
          type: "audio",
          date: "2024-01-08",
          duration: "25:45",
          source: "录音",
          preview: "跨部门协调会议，解决项目推进中的问题和冲突...",
        },
        {
          name: "客户沟通会议.mp4",
          size: "198.2 MB",
          type: "video",
          date: "2024-01-05",
          duration: "38:20",
          source: "导入",
          preview: "客户沟通会议，收集客户反馈和需求建议...",
        },
      ],
    }

    return baseFiles[folderName] || baseFiles["工作文档"]
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 侧边栏保持不变 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 保持原有侧边栏内容不变 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-gray-900">Voice AI</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">用户</p>
              <p className="text-sm text-gray-500 truncate">user@example.com</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* 用户下拉菜单 */}
          {isUserMenuOpen && (
            <div className="mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">账户设置</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                <span className="text-sm text-gray-700">邀请组员</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a1.5 1.5 0 11-2.12-2.12A1.5 1.5 0 018.94 6.94zM10 15.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">帮助</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 transition-colors group">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700 group-hover:text-red-600">登出</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 01-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">获取专业版</span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            <button
              onClick={() => setCurrentView("home")}
              className={`w-full flex items-center gap-3 p-3 text-left rounded-lg ${currentView === "home" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="font-medium">首页</span>
            </button>

            <button
              onClick={() => setCurrentView("import")}
              className={`w-full flex items-center gap-3 p-3 text-left rounded-lg ${currentView === "import" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">语音转录</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-gray-900">搜索</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-gray-900">应用</span>
            </button>
          </div>

          <div className="pt-4">
            <button
              className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-100 rounded-lg mb-1"
              onClick={() => setIsChannelsCollapsed(!isChannelsCollapsed)}
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isChannelsCollapsed ? "rotate-180" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">频道</span>
            </button>

            {!isChannelsCollapsed && (
              <div className="space-y-0.5 pl-6">
                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("channel")
                    setSelectedChannel("通用")
                  }}
                >
                  <span className="text-xs text-gray-400">#</span>
                  <span className="text-xs font-medium text-gray-700">通用</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("channel")
                    setSelectedChannel("公共")
                  }}
                >
                  <span className="text-xs text-gray-400">#</span>
                  <span className="text-xs font-medium text-gray-700">公共</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-100 rounded-lg mb-1"
              onClick={() => setIsDirectMessagesCollapsed(!isDirectMessagesCollapsed)}
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDirectMessagesCollapsed ? "rotate-180" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">私信</span>
            </button>

            {!isDirectMessagesCollapsed && (
              <div className="space-y-0.5 pl-6">
                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("dm")
                    setSelectedDM("张三")
                  }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">张三</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("dm")
                    setSelectedDM("李四")
                  }}
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">李四</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("dm")
                    setSelectedDM("王五")
                  }}
                >
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">王五</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("dm")
                    setSelectedDM("小组讨论")
                  }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">小组讨论</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-100 rounded-lg mb-1"
              onClick={() => setIsFoldersCollapsed(!isFoldersCollapsed)}
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isFoldersCollapsed ? "rotate-180" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">文件夹</span>
            </button>

            {!isFoldersCollapsed && (
              <div className="space-y-0.5 pl-6">
                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("folder")
                    setSelectedFolder("工作文档")
                  }}
                >
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">工作文档</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("folder")
                    setSelectedFolder("个人笔记")
                  }}
                >
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">个人笔记</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("folder")
                    setSelectedFolder("项目资料")
                  }}
                >
                  <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">项目资料</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 py-1.5 px-2 text-left hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setCurrentView("folder")
                    setSelectedFolder("会议记录")
                  }}
                >
                  <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">会议记录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 overflow-auto">
        {currentView === "home" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">转录历史</h1>
              <p className="text-lg text-gray-600">查看和管理您的语音转录记录</p>
            </div>

            {/* 历史记录列表 */}
            <Card>
              <CardHeader>
                <CardTitle>最近的转录</CardTitle>
                <CardDescription>您最近的语音转录记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historyRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{record.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                record.type === "录音" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {record.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{record.preview}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{record.date}</span>
                            <span>{record.time}</span>
                            <span>时长: {record.duration}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速开始</CardTitle>
                <CardDescription>开始新的语音转录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentView("import")}
                    className="flex items-center gap-3 px-8 py-6 h-auto"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-lg font-medium">导入文件</span>
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => setCurrentView("record")}
                    className="flex items-center gap-3 px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-lg font-medium text-white">开始录音</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "import" && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold text-gray-900">语音识别转录</h1>
                <p className="text-xl text-gray-600">选择导入文件或直接录音进行转录</p>
              </div>

              {/* 简洁的选择方式卡片 */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">选择转录方式</h2>
                      <p className="text-gray-600">您可以导入现有的音视频文件，或者直接录音进行转录</p>
                    </div>

                    <div className="flex gap-6 justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentView("upload")}
                        className="flex items-center gap-3 px-12 py-8 h-auto text-lg border-2 hover:border-gray-400"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">Import</span>
                      </Button>

                      <Button
                        size="lg"
                        onClick={() => setCurrentView("record")}
                        className="flex items-center gap-3 px-12 py-8 h-auto text-lg bg-blue-600 hover:bg-blue-700"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-white">Record</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === "upload" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">导入文件转录</h1>
              <p className="text-lg text-gray-600">上传视频或音频文件，自动转换为文字</p>
            </div>

            {/* 原有的文件上传功能 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="h-5 w-5" />
                  文件上传
                </CardTitle>
                <CardDescription>支持 MP4, AVI, MOV, MP3, WAV 等格式，最大文件大小 100MB</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language-select">选择语言</Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger id="language-select">
                          <SelectValue placeholder="选择转录语言" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">自动检测</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="en">英语</SelectItem>
                          <SelectItem value="ja">日语</SelectItem>
                          <SelectItem value="ko">韩语</SelectItem>
                          <SelectItem value="fr">法语</SelectItem>
                          <SelectItem value="de">德语</SelectItem>
                          <SelectItem value="es">西班牙语</SelectItem>
                          <SelectItem value="ru">俄语</SelectItem>
                          <SelectItem value="ar">阿拉伯语</SelectItem>
                          <SelectItem value="hi">印地语</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extract-keypoints">智能分析</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <Switch
                          id="extract-keypoints"
                          checked={extractKeyPoints}
                          onCheckedChange={setExtractKeyPoints}
                        />
                        <Label htmlFor="extract-keypoints" className="text-sm text-gray-600">
                          提取重点内容
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="generate-notes">生成笔记</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <Switch id="generate-notes" checked={generateNotes} onCheckedChange={setGenerateNotes} />
                        <Label htmlFor="generate-notes" className="text-sm text-gray-600">
                          生成上课笔记
                        </Label>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">拖拽文件到此处或点击选择文件</p>
                  <p className="text-sm text-gray-500">支持视频和音频文件</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {file && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileVideo className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {file.type.startsWith("audio/") && (
                          <Button variant="outline" size="sm" onClick={toggleAudioPlayback}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button onClick={handleUpload} disabled={isUploading} className="min-w-[100px]">
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              转录中...
                            </>
                          ) : (
                            "开始转录"
                          )}
                        </Button>
                      </div>
                    </div>

                    {file.type.startsWith("audio/") && (
                      <audio
                        ref={audioRef}
                        src={URL.createObjectURL(file)}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    )}
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>转录进度</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 转录结果等其他卡片保持不变 */}
            {transcription && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>转录结果</CardTitle>
                      <CardDescription>转录完成，共 {transcription.length} 个字符</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        下载文本
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="转录结果将显示在这里..."
                    className="min-h-[300px] resize-none"
                  />
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>您可以编辑上面的文本</span>
                    <span>{transcription.split(/\s+/).length} 词</span>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    重点内容提取
                  </CardTitle>
                  <CardDescription>AI智能分析提取的关键信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                      {keyPoints}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {classNotes && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        上课笔记
                      </CardTitle>
                      <CardDescription>AI智能生成的结构化课堂笔记</CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        const blob = new Blob([classNotes], { type: "text/plain" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "class-notes.txt"
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载笔记
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                      {classNotes}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentView === "record" && <RecordPage />}

        {currentView === "channel" && (
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {/* 频道头部 */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentView("home")} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">#</span>
                  <h1 className="text-xl font-bold text-gray-900">{selectedChannel}</h1>
                  <span className="text-sm text-gray-500">• 12 成员</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  邀请成员
                </Button>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            {/* 聊天消息区域 */}
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* 示例消息 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">张</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">张三</span>
                      <span className="text-xs text-gray-500">今天 14:30</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-800">
                        大家好！欢迎来到{selectedChannel}频道，我们可以在这里讨论相关话题。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">李</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">李四</span>
                      <span className="text-xs text-gray-500">今天 14:32</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-800">好的，我有一些想法想和大家分享。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 消息输入区域 */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`在 #${selectedChannel} 中发送消息...`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <Button>发送</Button>
              </div>
            </div>
          </div>
        )}

        {currentView === "dm" && (
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {/* 私信头部 */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentView("home")} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{selectedDM.charAt(0)}</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{selectedDM}</h1>
                    <span className="text-sm text-green-600">在线</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  语音通话
                </Button>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  视频通话
                </Button>
              </div>
            </div>

            {/* 私信消息区域 */}
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* 示例私信消息 */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{selectedDM.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{selectedDM}</span>
                      <span className="text-xs text-gray-500">今天 15:20</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                      <p className="text-gray-800">你好！有时间聊聊项目的事情吗？</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 flex justify-end">
                    <div className="max-w-md">
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        <span className="text-xs text-gray-500">今天 15:22</span>
                        <span className="font-medium text-gray-900">我</span>
                      </div>
                      <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm">
                        <p>当然可以！我现在有空，我们可以讨论一下。</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">我</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 私信输入区域 */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`给 ${selectedDM} 发送消息...`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <Button>发送</Button>
              </div>
            </div>
          </div>
        )}

        {currentView === "folder" && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 文件夹头部 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentView("home")} className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{selectedFolder}</h1>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          const folderFiles = getFolderFiles(selectedFolder)
                          return folderFiles.length
                        })()} 个文件 • 总计 {(() => {
                          const folderFiles = getFolderFiles(selectedFolder)
                          return folderFiles
                            .reduce((total, file) => {
                              const size = Number.parseFloat(file.size)
                              const unit = file.size.includes("MB") ? size : size / 1000
                              return total + unit
                            }, 0)
                            .toFixed(1)
                        })()} MB
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    上传文件
                  </Button>
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6.586A2 2 0 0117.414 13L16 14.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.586L2.586 13A2 2 0 012 11.414V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    新建文件夹
                  </Button>
                </div>
              </div>
            </div>

            {/* 文件列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>文件列表</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      列表视图
                    </Button>
                    <Button variant="outline" size="sm">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      网格视图
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 根据不同文件夹显示不同的转录文件 */}
                  {(() => {
                    const folderFiles = getFolderFiles(selectedFolder)
                    return folderFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            {file.type === "transcription" && (
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {file.type === "audio" && (
                              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.896-4.21-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.984 5.984 0 01-.757 2.828 1 1 0 11-1.415-1.656A3.989 3.989 0 0013 12a3.989 3.989 0 00-.172-1.172 1 1 0 010-1.657z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {file.type === "video" && (
                              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0116 8v4a1 1 0 01-1.447.894l-3-1.5a1 1 0 010-1.788l3-1.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {file.type === "notes" && (
                              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                  fillRule="evenodd"
                                  d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6.586A2 2 0 0117.414 13L16 14.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.586L2.586 13A2 2 0 012 11.414V5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900">{file.name}</h3>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  file.source === "录音" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {file.source}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{file.preview}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{file.date}</span>
                              <span>时长: {file.duration}</span>
                              <span>{file.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 w-4 mr-2" />
                            下载
                          </Button>
                          <Button variant="outline" size="sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
