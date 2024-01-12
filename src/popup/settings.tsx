import React, { FormEventHandler, useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  IS_RUNNING,
  OPENAI_API_KEY,
  OPENAI_MODEL_NAME,
} from "../common/consts";
import { FindJobExtensionMessageType, OpenAIModel } from "../common/types";
import { Resume } from "./resume";
import { sendMessage } from "./utils";

export const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(OpenAIModel.Gpt3dot5);
  const [canSave, setCanSave] = useState(false);
  const [showResetTips, setShowResetTips] = useState(false);

  const hasApiKey = useMemo(() => {
    return Boolean(apiKey) && !canSave;
  }, [apiKey, canSave]);

  useEffect(() => {
    const getKey = async () => {
      const data = await chrome.storage.local.get([
        OPENAI_API_KEY,
        OPENAI_MODEL_NAME,
      ]);

      if (data[OPENAI_API_KEY]) {
        setApiKey(data[OPENAI_API_KEY]);
      }
      if (data[OPENAI_MODEL_NAME]) {
        setModel(data[OPENAI_MODEL_NAME]);
      }
    };

    getKey();
  }, []);

  const onApiKeyInput: FormEventHandler<HTMLInputElement> = (e) => {
    setApiKey((e.target as any).value);
    setCanSave(true);
  };

  const onModelChange = (e: SelectChangeEvent) => {
    setModel((e.target as any).value);
    setCanSave(true);
  };

  const onSave = async () => {
    await chrome.storage.local.set({
      [OPENAI_API_KEY]: apiKey,
      [OPENAI_MODEL_NAME]: model,
    });
    setCanSave(false);
  };

  const onReset = async () => {
    await chrome.storage.local.set({ [IS_RUNNING]: false });
    await sendMessage(FindJobExtensionMessageType.Reset);
    setShowResetTips(false);
  };

  return (
    <div>
      <Card variant="outlined" sx={{ marginTop: "17px" }}>
        <CardContent>
          <Typography
            fontSize={17}
            variant="h6"
            style={{ marginBottom: "12px" }}
          >
            OpenAI 设置
          </Typography>

          <TextField
            sx={{ height: "42px" }}
            label="OpenAI API Key"
            fullWidth
            size="small"
            type="password"
            value={apiKey}
            onInput={onApiKeyInput}
          />

          <div style={{ marginBottom: "12px" }} />

          <Select
            color="info"
            sx={{ width: "100%", height: "42px" }}
            labelId="openai-model"
            id="openai-model-select"
            value={model}
            onChange={onModelChange}
            placeholder="选择模型"
          >
            <MenuItem value={OpenAIModel.Gpt3dot5}>GPT3.5</MenuItem>
            <MenuItem value={OpenAIModel.Gpt4}>GPT4</MenuItem>
            <MenuItem value={OpenAIModel.Gpt4Turbo}>GPT4-Turbo</MenuItem>
          </Select>

          <Box sx={{ padding: "17px 0 6px" }}>
            <Button
              variant="contained"
              disabled={!canSave}
              fullWidth
              onClick={onSave}
            >
              保存
            </Button>
          </Box>

          <Typography fontSize={17} variant="h6" style={{ marginTop: "24px" }}>
            简历管理
          </Typography>

          <Resume hasApiKey={hasApiKey} />

          <Box sx={{ padding: "17px 0 6px" }}>
            <Button
              color="warning"
              variant="contained"
              fullWidth
              onClick={() => setShowResetTips(true)}
            >
              重置状态(卡加载时点击)
            </Button>
          </Box>

          <Dialog
            open={showResetTips}
            onClose={() => setShowResetTips(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{`重置本地状态`}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                重置状态会移除所有简历和历史状态，确定要重置吗?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setShowResetTips(false);
                }}
              >
                取消
              </Button>
              <Button color="error" onClick={onReset} autoFocus>
                确定
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};
