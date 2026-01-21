import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import { Agent, VoltAgent } from '@voltagent/core'
import { VercelAIProvider } from '@voltagent/vercel-ai'
import { createOpenAI } from '@ai-sdk/openai'

// 从环境变量读取配置
const apiKey = process.env.OPENAI_API_KEY || process.env.SILICONFLOW_API_KEY
const baseURL = process.env.OPENAI_BASE_URL || 'https://api.siliconflow.cn/v1'

if (!apiKey) {
  console.warn('API key not found in environment variables')
}

// 创建 OpenAI 兼容的客户端（支持硅基流动）
const openaiClient = createOpenAI({
  apiKey,
  baseURL
})

// 创建一个简单的助手 agent
const assistantAgent = new Agent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant. Please respond in a friendly and concise manner.',
  llm: new VercelAIProvider(),
  model: openaiClient('Qwen/Qwen2.5-7B-Instruct') // 硅基流动上的模型
})

// 初始化 VoltAgent
new VoltAgent({
  agents: {
    assistant: assistantAgent
  }
})

/**
 * Agent IPC 服务
 */
export class AgentService extends IpcService {
  static readonly groupName = 'agent'

  @IpcMethod()
  async chat(message: string): Promise<string> {
    try {
      const response = await assistantAgent.generateText(message)
      return response.text || 'No response'
    } catch (error) {
      console.error('Agent chat error:', error)
      throw error
    }
  }
}
