import { IS_UPLOADING_RESUME } from "../common/consts";
import { OpenAIMessageType, RunningStatus } from "../common/types";
import { render } from "../core/content_ui";

export const initPrelude: () => Promise<{
  assistantId: string;
}> = async () => {
  const assistantId: any = await createAssistant().catch((err) => {
    console.error(err);
    // eslint-disable-next-line no-alert
    alert(
      `创建 openai 助手失败，清刷新页面重试\nError: ${err.message.toString()}`
    );

    throw err;
  });

  return { assistantId };
};

export const chat = async (
  userInput: string,
  assistantId: string,
  threadId = ""
) => {
  return new Promise((resolve, reject) => {
    console.info("getting response from openai");

    chrome.runtime.sendMessage(
      {
        type: OpenAIMessageType.Chat,
        data: { userInput, assistantId, threadId },
      },
      (response: any) => {
        switch (response.type) {
          case OpenAIMessageType.Chat: {
            const { data } = response;
            resolve(data);
            break;
          }
          case OpenAIMessageType.Error: {
            // eslint-disable-next-line no-alert
            alert(
              `OpenAI 调用失败，请打开插件 「设置」 面板确认正确填入了 OpenAI API Key，且本地代理服务器没有异常。\n错误：${response.data}`
            );
            reject(new Error(response.data));
            break;
          }
          default:
            reject(new Error("chat failed"));
        }
      }
    );
  });
};

const createAssistant = () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: OpenAIMessageType.CreateAssistant,
      },
      (response: any) => {
        switch (response.type) {
          case OpenAIMessageType.AssistantId: {
            const { data } = response;
            resolve(data);
            break;
          }
          case OpenAIMessageType.UploadResume: {
            uploadResume().then(resolve).catch(reject);
            break;
          }
          default:
        }
      }
    );
  });
};

export const uploadResume = () => {
  localStorage.setItem(IS_UPLOADING_RESUME, "1");

  return new Promise((resolve, reject) => {
    const _input = document.createElement("input");
    _input.type = "file";
    _input.multiple = false;
    _input.hidden = true;
    _input.accept = ".pdf, .doc, .docx, .txt, .png, .jpg, jpeg";
    document.body.appendChild(_input);

    _input.onfocus = () => {
      console.info("onfocus clicked");
    };

    _input.onchange = (e) => {
      const file = (e.target as any).files?.[0];

      if (file) {
        render(RunningStatus.Uploading);

        // eslint-disable-next-line node/no-unsupported-features/node-builtins, node/prefer-global/url
        const blobUrl = URL.createObjectURL(file);

        chrome.runtime.sendMessage(
          {
            type: OpenAIMessageType.UploadResume,
            data: {
              name: file.name,
              url: blobUrl,
            },
          },
          (response: any) => {
            localStorage.setItem(IS_UPLOADING_RESUME, "0");

            render(RunningStatus.Idle);

            if (response?.type === OpenAIMessageType.AssistantId) {
              resolve(response.data);
            } else {
              // eslint-disable-next-line no-alert
              alert(
                `上传简历失败，请打开插件 「设置」 面板确认正确填入了 OpenAI API Key，且本地代理服务器没有异常。\n错误: ${response.data}`
              );
              reject(new Error("upload resume failed"));
            }
          }
        );
      } else {
        reject(new Error("no file found"));
      }
    };

    _input.onerror = reject;

    _input.click();
  });
};
