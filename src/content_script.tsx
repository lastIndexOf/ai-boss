import { startChat, startFindJob, startLogin } from "./core/find_jobs";
import { uploadResume } from "./openai/content";
import {
  FindJobExtensionMessageType,
  OpenAIMessageType,
  RunningStatus,
} from "./common/types";
import { preRender, render } from "./core/content_ui";
import { BOSS_FIND_JOB_URL, IS_UPLOADING_RESUME } from "./common/consts";

const getKey = async (key: string) => {
  return {
    data: localStorage.getItem(key),
  };
};

const setKey = async (key: string, value: any) => {
  if (key && value) {
    localStorage.setItem(key, `${value}`);
  }
};

const resetLocalStatus = () => {
  localStorage.removeItem(IS_UPLOADING_RESUME);
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const { type } = msg;

  switch (type) {
    case FindJobExtensionMessageType.StartFindJob:
      render(RunningStatus.Running);
      startFindJob();
      return true;
    case FindJobExtensionMessageType.StartLogin:
      startLogin();
      return true;
    case FindJobExtensionMessageType.StartChat:
      startChat();
      return true;
    case FindJobExtensionMessageType.GetKey:
      getKey(msg.data).then(sendResponse);
      return true;
    case FindJobExtensionMessageType.SetKey:
      setKey(msg.data.key, msg.data.value).then(sendResponse);
      return true;
    case FindJobExtensionMessageType.Render:
      render(msg.data);
      return true;
    case FindJobExtensionMessageType.Log:
      console.info(msg.data);
      return true;
    case OpenAIMessageType.UploadResume:
      uploadResume().then(sendResponse);
      return true;
    case OpenAIMessageType.ApiKeyError:
      // eslint-disable-next-line no-alert
      alert(
        "连接 OpenAI 失败，请打开插件 「设置」 面板确认正确填入了 OpenAI API Key，且本地代理服务器没有异常。\n"
      );
      return true;
    case OpenAIMessageType.Error:
      // eslint-disable-next-line no-alert
      alert(
        `OpenAI 调用失败，请打开插件 「设置」 面板确认正确填入了 OpenAI API Key，且本地代理服务器没有异常。\n错误：${msg.data}`
      );
      return true;
    case FindJobExtensionMessageType.OpenRecommend:
      window.open(BOSS_FIND_JOB_URL, "_blank");
      return true;
    case FindJobExtensionMessageType.Reset:
      resetLocalStatus();
      location.reload();
      return true;
    case FindJobExtensionMessageType.Stop:
      location.reload();
      return true;
    default:
      return true;
  }
});

preRender();
