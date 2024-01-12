import OpenAI, { toFile } from 'openai';
import {
  BOSS_HOST,
  OPENAI_API_KEY,
  PRIVATE_ASSISTANT,
  PRIVATE_ASSISTANT_RESUME_NAME,
  PRIVATE_ASSISTANT_RESUME_UPDATED_AT,
} from '../common/consts';
import {
  FindJobExtensionMessageType,
  OpenAIMessageType,
} from '../common/types';
import { sleep } from '../common/utils';
import { assistant_instructions } from './prompts';

export const sendMessage = (
  type: FindJobExtensionMessageType | OpenAIMessageType,
  data?: any,
) => {
  return new Promise(resolve => {
    chrome.tabs.query({ currentWindow: true, active: true }, async tabs => {
      for (const tab of tabs) {
        const { id, url } = tab;

        if (id && url && url.startsWith(BOSS_HOST)) {
          chrome.tabs.sendMessage(
            id,
            {
              type,
              data,
            },
            response => {
              resolve(response);
            },
          );

          break;
        }
      }
    });
  });
};

let client: OpenAI | null;
const getClient = async () => {
  if (!client) {
    try {
      client = new OpenAI({
        apiKey: (await chrome.storage.local.get(OPENAI_API_KEY))[
          OPENAI_API_KEY
        ],
      });
    } catch (err) {
      console.error('create openai client error: ', err);
      sendMessage(OpenAIMessageType.ApiKeyError);
      throw err;
    }
  }

  return client;
};

export const initPrelude = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case OpenAIMessageType.CreateAssistant: {
        createAssistant().then(sendResponse);
        return true;
      }
      case OpenAIMessageType.UploadResume: {
        uploadResume(message.data).then(sendResponse);
        return true;
      }
      case OpenAIMessageType.Chat: {
        chat(message.data).then(sendResponse);
        return true;
      }
      default:
        return true;
    }
  });
};

const createAssistant = async () => {
  const data = await chrome.storage.local.get(PRIVATE_ASSISTANT);

  if (data[PRIVATE_ASSISTANT]) {
    console.info('Loaded existing assistant ID.');
    return {
      type: OpenAIMessageType.AssistantId,
      data: data[PRIVATE_ASSISTANT],
    };
  }

  // 没有简历，需要上传简历
  console.info('Not assistant found, need upload resume');
  return {
    type: OpenAIMessageType.UploadResume,
  };
};

const uploadResume = async ({ url, name }: { name: string; url: string }) => {
  try {
    const res = await fetch(url);
    const file = await (
      await getClient()
    ).files.create({
      file: await toFile(res, 'my_resume.pdf'),
      purpose: 'assistants',
    });

    const assistant = await (
      await getClient()
    ).beta.assistants.create({
      instructions: assistant_instructions,
      model: 'gpt-3.5-turbo-1106',
      tools: [{ type: 'retrieval' }],
      file_ids: [file.id],
    });

    await chrome.storage.local.set({
      [PRIVATE_ASSISTANT]: assistant.id,
      [PRIVATE_ASSISTANT_RESUME_NAME]: name,
      [PRIVATE_ASSISTANT_RESUME_UPDATED_AT]: Date.now(),
    });

    return {
      type: OpenAIMessageType.AssistantId,
      data: assistant.id,
    };
  } catch (err: any) {
    console.error('upload resume error: ', err.toString());
    client = null;
    return {
      type: OpenAIMessageType.Error,
      data: err.toString(),
    };
  }
};

const chat = async ({
  userInput,
  assistantId,
  threadId,
}: {
  userInput: string;
  assistantId: string;
  threadId: string;
}) => {
  let extractThreadId = threadId;

  if (!extractThreadId) {
    extractThreadId = await createThread();
    if (!extractThreadId) {
      client = null;
      return { type: OpenAIMessageType.Error, data: 'Failed to create thread' };
    }
  }

  try {
    await (
      await getClient()
    ).beta.threads.messages.create(extractThreadId, {
      content: userInput,
      role: 'user',
    });
    const run = await (
      await getClient()
    ).beta.threads.runs.create(extractThreadId, {
      assistant_id: assistantId,
    });

    console.info(`用户输入:\n${userInput}\n\n`);

    while (true) {
      const runStatus = await (
        await getClient()
      ).beta.threads.runs.retrieve(extractThreadId, run.id);

      if (runStatus.status === 'completed') {
        break;
      } else if (runStatus.status === 'requires_action') {
        await sleep(1000);
      }
    }

    const messages = await (
      await getClient()
    ).beta.threads.messages.list(extractThreadId);
    const assistatantMessage = (messages.data[0].content[0] as any).text.value;

    const formattedMessage = assistatantMessage.replace('\n', ' ');

    console.info(`问候：\n${formattedMessage}\n\n`);

    return { type: OpenAIMessageType.Chat, data: formattedMessage };
  } catch (err: any) {
    console.error('An error occurred: ', err);
    client = null;
    return { type: OpenAIMessageType.Error, data: err.message };
  }
};

const createThread = async () => {
  try {
    const response = await (await getClient()).beta.threads.create();
    return response.id;
  } catch (err) {
    client = null;
    console.error('Error creating thread: ', err);
    return '';
  }
};
