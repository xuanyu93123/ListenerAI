import OpenAI from "openai";

export class OpenAIAssistant {
  public client: OpenAI;
  private assistantId: string;
  private threadId: string | null = null;
  systemPrompt: string | null = null;

  constructor(apiKey: string, assistantId: string, systemPrompt?: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    this.assistantId = assistantId;
    if (systemPrompt) this.systemPrompt = systemPrompt;
  }

  // 設置 threadId
  public setThreadId(threadId: string) {
    this.threadId = threadId;
  }

  // 確保 threadId 持續存在，不會每次重新建立
  public async getOrCreateThreadId(): Promise<string> {
    if (!this.threadId) {
      const thread = await this.client.beta.threads.create();
      this.threadId = thread.id;
    }
    
    return this.threadId;
  }

  // 取得 AI 的回應
  public async getResponse(
    userMessage: string,
    onTextDelta: (textDelta: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void // 新增回呼
  ): Promise<void> {
    try {
      const threadId = await this.getOrCreateThreadId();
  
      // 新增使用者訊息到 thread
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: userMessage,
      });
  
      // 使用流式回應
      const run = this.client.beta.threads.runs.stream(threadId, {
        assistant_id: this.assistantId,
      });
  
      run
        .on("textCreated", () => {
          console.log("Assistant started responding...");
        })
        .on("textDelta", (textDelta) => {
          if (textDelta.value) {
            onTextDelta(textDelta.value); // 確保 value 存在後再傳遞
          }
        })
        .on("end", () => {
          console.log("Streaming completed.");
          onComplete(); // 通知流式回應完成
        })
        .on("toolCallCreated", (toolCall) => {
          console.log(`Tool call created: ${toolCall.type}`);
        })
        .on("toolCallDelta", (toolCallDelta) => {
          console.log("Tool call delta:", toolCallDelta);
        })
        .on("error", (error) => {
          console.error("Error during streaming:", error);
          onError(error); // 傳遞錯誤給回呼函數
        });
    } catch (error) {
      console.error("Failed to get response:", error);
      if (error instanceof Error) {
        onError(error); // 確保 error 是 Error 類型
      } else {
        onError(new Error("Unknown error occurred")); // 如果不是 Error，創建一個新的 Error
      }
    }
  }

  // 取得開場白
  async getOpeningMessage(isNewUser: boolean): Promise<string> {
    const threadId = await this.getOrCreateThreadId();
  
    if (isNewUser) {
      return "你好啊很高興見到你，歡迎你來到Listener AI，我是接下來會陪著你完成心靈旅程的相談夥伴，你最近有發生什麼有趣的事想和我分享嗎？";
    }
  
    // 從資料庫中獲取摘要文字
    const userId = sessionStorage.getItem("user_id");
    const response = await fetch("http://localhost:5000/api/getConversationSummary", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userId}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to get conversation summary");
    }
    const { summary } = data;
      
    // **發送「請 AI 產生開場白」的 user 訊息**
    await this.client.beta.threads.messages.create(threadId, {
      role: "user",
      content: `這是我們最近的對話摘要：
      ${summary}
  
      請根據這些對話內容，產生一個自然的開場白，顯示你記得過去的內容，並表現出友善與關心使用者。`,
    });
  
    // 執行 Assistant，讓 AI 產生開場白
    const run = await this.client.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: this.assistantId,
    });
  
    if (run.status === "completed") {
      const updatedMessages = await this.client.beta.threads.messages.list(threadId);
      const lastMessage = updatedMessages.data.find((msg) => msg.role === "assistant");
  
      if (lastMessage && lastMessage.content[0].type === "text") {
        return lastMessage.content[0].text.value;
      }
    }
  
    return "開始對話吧！"; // 如果發生錯誤，回傳預設開場白
  }
}