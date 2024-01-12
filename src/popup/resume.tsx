import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
import AccountBox from "@mui/icons-material/AccountBox";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import {
  IS_UPLOADING_RESUME,
  PRIVATE_ASSISTANT,
  PRIVATE_ASSISTANT_RESUME_NAME,
  PRIVATE_ASSISTANT_RESUME_UPDATED_AT,
} from "../common/consts";
import {
  FindJobExtensionMessageType,
  OpenAIMessageType,
} from "../common/types";
import { sendMessage } from "./utils";

export const Resume = ({ hasApiKey }: { hasApiKey: boolean }) => {
  const [, setAssistantId] = useState("");
  const [resume, setResume] = useState("");
  const [lastModified, setLastModified] = useState(Date.now());
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    getIsLoading();
  }, []);

  const getIsLoading = async () => {
    const { data }: any =
      (await sendMessage(
        FindJobExtensionMessageType.GetKey,
        IS_UPLOADING_RESUME
      )) || {};

    const isLoading = data === "1";

    setLoading(data === "1");
    if (isLoading) {
      setTimeout(() => {
        getIsLoading();
      }, 1000);
    } else {
      getKey();
    }
  };

  const getKey = async () => {
    const data = await chrome.storage.local.get([
      PRIVATE_ASSISTANT,
      PRIVATE_ASSISTANT_RESUME_NAME,
      PRIVATE_ASSISTANT_RESUME_UPDATED_AT,
    ]);

    if (
      data[PRIVATE_ASSISTANT] &&
      data[PRIVATE_ASSISTANT_RESUME_NAME] &&
      data[PRIVATE_ASSISTANT_RESUME_UPDATED_AT]
    ) {
      setCanUpload(false);
    } else {
      setCanUpload(true);
    }

    setAssistantId(data[PRIVATE_ASSISTANT]);
    setResume(data[PRIVATE_ASSISTANT_RESUME_NAME] || "");
    setLastModified(data[PRIVATE_ASSISTANT_RESUME_UPDATED_AT] || Date.now());
  };

  const onUpload = async () => {
    setLoading(true);
    await sendMessage(OpenAIMessageType.UploadResume);
    getIsLoading();
  };

  const onDelete = () => {
    chrome.storage.local.remove([
      PRIVATE_ASSISTANT,
      PRIVATE_ASSISTANT_RESUME_NAME,
      PRIVATE_ASSISTANT_RESUME_UPDATED_AT,
    ]);

    setAssistantId("");
    setResume("");
    setLastModified(Date.now());
    setCanUpload(true);

    setShowDeleteDialog(false);
  };

  const content = canUpload ? (
    <ListItem>{hasApiKey ? `请上传简历` : `请设置 OpenAI API Key`}</ListItem>
  ) : (
    <ListItem
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => setShowDeleteDialog(true)}
        >
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <AccountBox />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={resume}
        secondary={dayjs(lastModified).format("YYYY-MM-DD HH:mm")}
      />
    </ListItem>
  );
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {content}
      <ListItem>
        {loading ? (
          <LoadingButton loading fullWidth variant="outlined">
            上传简历
          </LoadingButton>
        ) : (
          <Button
            variant="outlined"
            disabled={!canUpload || !hasApiKey}
            fullWidth
            onClick={onUpload}
          >
            上传简历
          </Button>
        )}
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{`删除简历`}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              确定要删除该简历吗，该操作不可逆转?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
              }}
            >
              取消
            </Button>
            <Button color="error" onClick={onDelete} autoFocus>
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </ListItem>
    </List>
  );
};
