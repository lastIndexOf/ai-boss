import React, { FormEventHandler, useEffect, useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { OPENAI_API_KEY } from '../common/consts';
import { Resume } from './resume';

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [canSave, setCanSave] = useState(false);

  const hasApiKey = useMemo(() => {
    return Boolean(apiKey) && !canSave;
  }, [apiKey, canSave]);

  useEffect(() => {
    const getKey = async () => {
      const data = await chrome.storage.local.get(OPENAI_API_KEY);

      if (data[OPENAI_API_KEY]) {
        setApiKey(data[OPENAI_API_KEY]);
      }
    };

    getKey();
  }, []);

  const onInput: FormEventHandler<HTMLInputElement> = e => {
    setApiKey((e.target as any).value);
    setCanSave(true);
  };

  const onSave = () => {
    chrome.storage.local.set({ [OPENAI_API_KEY]: apiKey });
    setCanSave(false);
  };

  return (
    <div>
      <Card variant="outlined" sx={{ marginTop: '17px' }}>
        <CardContent>
          <Typography
            fontSize={17}
            variant="h6"
            style={{ marginBottom: '12px' }}
          >
            OpenAI 设置
          </Typography>

          <TextField
            label="OpenAI API Key"
            fullWidth
            size="small"
            type="password"
            value={apiKey}
            onInput={onInput}
          />

          <Box sx={{ padding: '17px 0 6px' }}>
            <Button
              variant="contained"
              disabled={!canSave}
              fullWidth
              onClick={onSave}
            >
              保存
            </Button>
          </Box>

          <Typography fontSize={17} variant="h6" style={{ marginTop: '24px' }}>
            简历管理
          </Typography>

          <Resume hasApiKey={hasApiKey} />
        </CardContent>
      </Card>
    </div>
  );
};
