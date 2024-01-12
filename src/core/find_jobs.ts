import { chat, initPrelude } from '../openai/content';
import {
  BOSS_JOB_LABEL,
  INSTURCTION_LETTER,
  JOB_INDEX,
  JOB_PAGE_SIZE,
} from '../common/consts';
import { jumpToPage, queryUntilNotNull, sleep } from '../common/utils';
import { RunningStatus } from '../common/types';
import { render } from './content_ui';

let start = false;

export const startFindJob = async () => {
  if (start) {
    return -1;
  }

  start = true;
  const loginBtn = document.querySelector('#header .header-login-btn');

  if (loginBtn) {
    start = false;
    return (loginBtn as any).click();
  }

  console.info('start auto find job');

  doStartFindJob();
  return -1;
};

export const startChat = async () => {
  if (start) {
    return -1;
  }

  start = true;
  const response = localStorage.getItem(INSTURCTION_LETTER);

  if (response) {
    const chatBox = await queryUntilNotNull('#chat-input');

    (chatBox as any).innerHTML = response;

    await sleep(100);
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      charCode: 13,
      bubbles: true,
    });
    (chatBox as any).dispatchEvent(inputEvent);
    await sleep(100);
    (chatBox as any).dispatchEvent(enterEvent);
    await sleep(100);

    const jobIndex = Number(localStorage.getItem(JOB_INDEX) || '1');
    localStorage.setItem(JOB_INDEX, `${jobIndex + 1}`);
    localStorage.removeItem(INSTURCTION_LETTER);
    await sleep(500);
    history.back();
  }

  return -1;
};

const doStartFindJob = async () => {
  const { assistantId } = await initPrelude();

  const jobIndex = Number(localStorage.getItem(JOB_INDEX) || '1');

  await sleep(1500);
  selectDropdownOption();
  await sleep(100);

  const jobDescription = await getJobDescriptionByIndex(jobIndex);

  if (jobDescription) {
    render(RunningStatus.Generating);

    const response = await chat(jobDescription, assistantId as any);
    localStorage.setItem(INSTURCTION_LETTER, response as string);

    render(RunningStatus.Running);

    await sleep(1000);
    const contactBtn = await queryUntilNotNull(
      `#wrap > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(2) > a:nth-child(2)`,
    );
    (contactBtn as any).click();
  }
};

const selectDropdownOption = () => {
  const triggerElements: any = document.querySelectorAll(
    '.recommend-job-btn.has-tooltip',
  );

  let found = false;
  for (const element of triggerElements) {
    const text = element.innerText;

    if (text.includes(BOSS_JOB_LABEL)) {
      found = true;
      element.click();
      break;
    }
  }

  if (found) {
    return;
  }

  if (triggerElements.length) {
    found = true;
    triggerElements[0].click();
    return;
  }

  // eslint-disable-next-line no-alert
  alert('请先添加期望职位');

  console.info('not found');
};

const getJobDescriptionByIndex = async (jobIndex: number) => {
  // 让它加载出职位列表再换页面
  await queryUntilNotNull(
    '#wrap > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div:nth-child(2) > p',
  );

  const page = Math.ceil(jobIndex / JOB_PAGE_SIZE);
  if (page !== 1) {
    await jumpToPage(
      (await queryUntilNotNull('.job-recommend-main')) as HTMLDivElement,
      page,
    );
  }

  try {
    const jobSelector = await queryUntilNotNull(
      `#wrap > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) > ul > li:nth-child(${jobIndex})`,
    );
    (jobSelector as any).click();

    await sleep(100);

    const descriptionSelector = await queryUntilNotNull(
      '#wrap > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div:nth-child(2) > p',
    );
    return (descriptionSelector as any).innerText;
  } catch (err) {
    console.error(`No job found at index ${jobIndex}`);
    return null;
  }
};

export const startLogin = () => {
  if (start) {
    return -1;
  }

  start = true;
  const wxLoginBtn = document.querySelector('.wx-login-area .wx-login-btn');

  if (wxLoginBtn) {
    (wxLoginBtn as any).click();
  }

  return -1;
};
