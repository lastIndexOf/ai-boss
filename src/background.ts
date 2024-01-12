import {
  BOSS_CHAT_BOX,
  BOSS_FIND_JOB_URL,
  BOSS_LOGIN_URL,
  BOSS_URLS,
  IS_RUNNING,
} from "./common/consts";
import { FindJobExtensionMessageType } from "./common/types";

import { initPrelude } from "./openai/background";

const startAutoFindJobProcess = ({
  url,
  tabId,
}: {
  url?: string;
  tabId?: number;
}) => {
  if (tabId) {
    if (url?.startsWith(BOSS_FIND_JOB_URL)) {
      chrome.tabs.sendMessage(tabId, {
        type: FindJobExtensionMessageType.StartFindJob,
      });
    } else if (url?.startsWith(BOSS_LOGIN_URL)) {
      chrome.tabs.sendMessage(tabId, {
        type: FindJobExtensionMessageType.StartLogin,
      });
    } else if (url?.startsWith(BOSS_CHAT_BOX)) {
      chrome.tabs.sendMessage(tabId, {
        type: FindJobExtensionMessageType.StartChat,
      });
    } else {
      console.info("not in boss zhipin");
    }
  }
};

initPrelude();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, { url }) => {
  if (changeInfo.status === "complete") {
    if (BOSS_URLS.find((u) => url?.startsWith(u))) {
      const data = await chrome.storage.local.get(IS_RUNNING);
      if (data[IS_RUNNING]) {
        console.info("auto find job is running");

        startAutoFindJobProcess({
          url,
          tabId,
        });
        // chrome.tabs.sendMessage(tabId, {});
      } else {
        console.info("auto find job not running");
      }
    }
  }
});
