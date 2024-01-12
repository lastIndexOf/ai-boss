export interface FindJobExtensionMessage {
  type: FindJobExtensionMessageType;
}

export enum FindJobExtensionMessageType {
  StartFindJob = 'start_find_job',
  StartLogin = 'start_login',
  StartChat = 'start_chat',
  Stop = 'stop',
  Render = 'render',
  GetKey = 'get_key',
  SetKey = 'set_key',
  Log = 'log',
}

export enum OpenAIMessageType {
  CreateAssistant = 'create_assistant',
  AssistantId = 'assistant_id',
  UploadResume = 'upload_resume',
  Chat = 'chat',
  ApiKeyError = 'api_key_error',
  Error = 'error',
}

export enum RunningStatus {
  Idle = 'idle',
  // 正常执行自动化流程
  Running = 'running',
  // 上传简历中
  Uploading = 'uploading',
  // 调用 openai 生成中
  Generating = 'generating',
}
