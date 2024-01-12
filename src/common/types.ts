export interface FindJobExtensionMessage {
  type: FindJobExtensionMessageType;
}

export enum FindJobExtensionMessageType {
  StartFindJob = "start_find_job",
  StartLogin = "start_login",
  StartChat = "start_chat",
  Render = "render",
  GetKey = "get_key",
  SetKey = "set_key",
  Log = "log",
  OpenRecommend = "open_recommend",
  Reset = "reset",
  Stop = "stop",
}

export enum OpenAIMessageType {
  CreateAssistant = "create_assistant",
  AssistantId = "assistant_id",
  UploadResume = "upload_resume",
  Chat = "chat",
  ApiKeyError = "api_key_error",
  Error = "error",
}

export enum OpenAIModel {
  Gpt3dot5 = "gpt-3.5-turbo-1106",
  Gpt4 = "gpt-4",
  Gpt4Turbo = "gpt-4-1106-preview",
}

export enum RunningStatus {
  Idle = "idle",
  // 正常执行自动化流程
  Running = "running",
  // 上传简历中
  Uploading = "uploading",
  // 调用 openai 生成中
  Generating = "generating",
}
