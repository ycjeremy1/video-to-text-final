import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json()

    if (!transcription) {
      return NextResponse.json({ error: "没有找到转录内容" }, { status: 400 })
    }

    // 使用 AI 生成结构化的上课笔记
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

请确保：
1. 保持原始内容的准确性
2. 使用清晰的层次结构
3. 突出重要概念和关键信息
4. 适合学习和复习使用
5. 使用中文输出

转录内容：
${transcription}`,
    })

    return NextResponse.json({
      notes: notes,
    })
  } catch (error) {
    console.error("生成笔记错误:", error)
    return NextResponse.json({ error: "生成笔记过程中出现错误，请稍后重试" }, { status: 500 })
  }
}
