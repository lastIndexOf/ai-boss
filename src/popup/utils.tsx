import { useEffect, useState } from "react";
import { BOSS_HOST } from "../common/consts";
import {
  FindJobExtensionMessageType,
  OpenAIMessageType,
} from "../common/types";

export const sendMessage = (
  type: FindJobExtensionMessageType | OpenAIMessageType,
  data?: any
) => {
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      let sended = false;
      for (const tab of tabs) {
        const { id, url } = tab;

        if (id && url && url.startsWith(BOSS_HOST)) {
          sended = true;
          chrome.tabs.sendMessage(
            id,
            {
              type,
              data,
            },
            (response) => {
              resolve(response);
            }
          );

          break;
        }
      }

      if (!sended) {
        resolve(null);
      }
    });
  });
};

export const useExtension = () => {
  const [showExtension, setShowExtension] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      for (const tab of tabs) {
        const { id, url } = tab;

        if (id && url && url.startsWith(BOSS_HOST)) {
          setShowExtension(true);
        }
      }
    });
  }, []);

  return { showExtension };
};
