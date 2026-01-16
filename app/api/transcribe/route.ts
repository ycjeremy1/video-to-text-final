import { type NextRequest, NextResponse } from "next/server"
import { transcribe, generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const language = (formData.get("language") as string) || "auto"
    const extractKeyPoints = formData.get("extractKeyPoints") === "true"
    const generateNotes = formData.get("generateNotes") === "true"

    if (!file) {
      return NextResponse.json({ error: "没有找到文件" }, { status: 400 })
    }

    // 检查文件大小 (100MB 限制)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小超过100MB限制" }, { status: 400 })
    }

    // 准备转录选项
    const transcribeOptions: any = {
      model: openai("whisper-1"),
      file: file,
    }

    // 如果不是自动检测，添加语言参数
    if (language !== "auto") {
      transcribeOptions.language = language
    }

    // 使用 AI SDK 的 transcribe 函数
    const { text } = await transcribe(transcribeOptions)

    let keyPoints = ""

    // 如果需要提取重点
    if (extractKeyPoints && text.trim()) {
      try {
        const { text: extractedPoints } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `请分析以下转录文本，提取出关键信息和重点内容。请用简洁明了的方式总结，包括：
1. 主要话题和核心观点
2. 重要的数据、时间、人名、地点等关键信息
3. 行动项目或结论
4. 其他值得注意的要点

转录文本：
${text}

请用中文回答，格式清晰，重点突出：`,
        })
        keyPoints = extractedPoints
      } catch (error) {
        console.error("重点提取错误:", error)
        // 如果重点提取失败，不影响主要转录功能
      }
    }

    let classNotes = ""

    // 如果需要生成笔记
    if (generateNotes && text.trim()) {
      try {
        const { text: notes } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `请将以下课堂转录内容整理成结构化的上课笔记。请按照以下格式组织内容：

📚 课程主题：[提取课程的主要主题]

📝 课程大纲：
1. [主要知识点1]
   - [子要点1]
   - [子要点2]
2. [主要知识点2]
   - [子要点1]
   - [子要点2]

🔑 重要概念：
• [概念1]：[简要解释]
• [概念2]：[简要解释]

💡 关键要点：
- [要点1]
- [要点2]
- [要点3]

📖 详细内容：
[按逻辑顺序整理的详细内容，保持原意但结构化呈现]

❓ 思考问题：
1. [基于内容提出的思考问题1]
2. [基于内容提出的思考问题2]

📋 课后总结：
[对整节课内容的简要总结]

转录内容：
${text}`,
        })
        classNotes = notes
      } catch (error) {
        console.error("生成笔记错误:", error)
      }
    }

    return NextResponse.json({
      transcription: text,
      keyPoints: keyPoints || undefined,
      classNotes: classNotes || undefined,
      filename: file.name,
      size: file.size,
      language: language,
    })
  } catch (error) {
    console.error("转录错误:", error)
    return NextResponse.json({ error: "转录过程中出现错误，请稍后重试" }, { status: 500 })
  }
}
