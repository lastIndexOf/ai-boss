import React, { FormEventHandler, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import debounce from "lodash.debounce";
import { FindJobExtensionMessageType } from "../common/types";
import {
  JOB_INDEX,
  OPENAI_API_KEY,
  PRIVATE_ASSISTANT,
  PRIVATE_ASSISTANT_RESUME_NAME,
  PRIVATE_ASSISTANT_RESUME_UPDATED_AT,
} from "../common/consts";
import { sendMessage } from "./utils";

const doSetJobIndex = debounce((value: number) => {
  sendMessage(FindJobExtensionMessageType.SetKey, { key: JOB_INDEX, value });
}, 500);

export const Workflow = ({
  run,
  running,
}: {
  running: boolean;
  run: () => void;
}) => {
  const [jobIndex, setJobIndex] = useState(1);
  const [canRun, setCanRun] = useState(false);

  useEffect(() => {
    const getJobIndex = async () => {
      const { data }: any =
        (await sendMessage(FindJobExtensionMessageType.GetKey, JOB_INDEX)) ||
        {};
      setJobIndex(data);
    };

    getJobIndex();
  }, []);

  useEffect(() => {
    getKey();
  }, []);

  const getKey = async () => {
    const data = await chrome.storage.local.get([
      PRIVATE_ASSISTANT,
      PRIVATE_ASSISTANT_RESUME_NAME,
      PRIVATE_ASSISTANT_RESUME_UPDATED_AT,
      OPENAI_API_KEY,
    ]);

    if (
      data[PRIVATE_ASSISTANT] &&
      data[PRIVATE_ASSISTANT_RESUME_NAME] &&
      data[PRIVATE_ASSISTANT_RESUME_UPDATED_AT] &&
      data[OPENAI_API_KEY]
    ) {
      setCanRun(true);
    } else {
      setCanRun(false);
    }
  };

  const onInput: FormEventHandler<HTMLInputElement> = (e) => {
    if ((e.target as any).value > 0 || (e.target as any).value < 999) {
      setJobIndex((e.target as any).value);
      doSetJobIndex((e.target as any).value);
    }
  };

  const beforeRunLabel = canRun ? "运行" : "请先设置 OpenAI API Key 和简历";

  return (
    <div>
      <Card variant="outlined" style={{ marginTop: "12px" }}>
        <CardContent>
          <Typography
            fontSize={17}
            variant="h6"
            style={{ marginBottom: "12px" }}
          >
            工作流设置
          </Typography>
          <TextField
            label="开始索引（从第几个岗位开始投递）"
            fullWidth
            size="small"
            type="number"
            value={jobIndex}
            onInput={onInput}
          />
        </CardContent>
      </Card>

      <Box sx={{ padding: "17px 0 6px" }}>
        {running && <LinearProgress style={{ marginBottom: "12px" }} />}
        <Button
          variant="contained"
          fullWidth
          disabled={!canRun}
          onClick={run}
          color={running ? "error" : "primary"}
        >
          {running ? "停止" : beforeRunLabel}
        </Button>
      </Box>
    </div>
  );
};
