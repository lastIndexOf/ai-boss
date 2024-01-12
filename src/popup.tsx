import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Settings } from "./popup/settings";
import { Workflow } from "./popup/workflow";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  BOSS_CHAT_BOX,
  BOSS_FIND_JOB_URL,
  BOSS_HOST,
  BOSS_LOGIN_URL,
  BOSS_URLS,
  IS_RUNNING,
} from "./common/consts";
import { FindJobExtensionMessageType } from "./common/types";
import { useExtension } from "./popup/utils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Popup = () => {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  const { showExtension } = useExtension();

  useEffect(() => {
    const getIsRunning = async () => {
      const data = await chrome.storage.local.get(IS_RUNNING);

      if (data[IS_RUNNING]) {
        setRunning(true);
        setValue(1);
      }
    };

    getIsRunning();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const run = () => {
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      for (const tab of tabs) {
        const { id, url } = tab;

        if (id && url && BOSS_URLS.find((u) => url?.startsWith(u))) {
          const data = await chrome.storage.local.get(IS_RUNNING);

          if (!data[IS_RUNNING]) {
            await chrome.storage.local.set({ [IS_RUNNING]: true });
            startAutoFindJobProcess({
              url,
              tabId: id,
            });
          } else {
            await chrome.storage.local.set({ [IS_RUNNING]: false });
            chrome.tabs.sendMessage(id, {
              type: FindJobExtensionMessageType.Stop,
            });
          }

          setRunning(!running);
        }
      }
    });
  };

  return (
    <div style={{ width: "345px", margin: 0, padding: 0, marginBottom: 20 }}>
      {showExtension ? (
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="设置" {...a11yProps(0)} />
              <Tab label="开始" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Settings />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Workflow run={run} running={running} />
          </CustomTabPanel>
        </Box>
      ) : (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          请在 Boss 直聘站点启用此插件
        </Box>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

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
    } else if (url?.startsWith(BOSS_HOST)) {
      chrome.tabs.sendMessage(tabId, {
        type: FindJobExtensionMessageType.OpenRecommend,
      });
    } else {
      console.info("not in boss zhipin");
    }
  }
};
