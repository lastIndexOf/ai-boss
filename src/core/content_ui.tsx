import { MASK_ID } from '../common/consts';
import { RunningStatus } from '../common/types';
import { loadingSvg } from './loading';

export const preRender = () => {
  const container = document.createElement('div');
  container.id = MASK_ID;

  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '999999';
  container.style.backgroundColor = 'rgba(0,0,0,0.3)';
  container.style.display = 'none';

  container.innerHTML = ``;

  document.body.appendChild(container);
};

export const render = (status: RunningStatus) => {
  const container: HTMLDivElement = document.querySelector(`#${MASK_ID}`)!;

  switch (status) {
    case RunningStatus.Idle:
      container.style.display = 'none';
      break;
    case RunningStatus.Running:
      container.style.display = 'block';
      container.innerHTML = `<div style="width: 100%; height: 100%; position: relative;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      ${loadingSvg}
      <div class="dot-anim" style="margin-top: 0; width: 64px; color: white">运行中</div>
    </div>

    <style>
      @keyframes dotPulse {
          0% { content: '.'; }
          25% { content: '..'; }
          50% { content: '...'; }
          75% { content: '..'; }
          100% { content: '.'; }
      }
      .dot-anim:after {
          content: "";
          animation: dotPulse 2s ease-in-out infinite;
          animation-timing-function: step-end;
      }

    </style>
</div>`;
      break;
    case RunningStatus.Uploading:
      container.style.display = 'block';
      container.innerHTML = `<div style="width: 100%; height: 100%; position: relative;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      ${loadingSvg}
      <div class="dot-anim" style="margin-top: 0; width: 240px; color: white">正在上传简历，可能需要 5 - 20 秒</div>
    </div>

    <style>
      @keyframes dotPulse {
          0% { content: '.'; }
          25% { content: '..'; }
          50% { content: '...'; }
          75% { content: '..'; }
          100% { content: '.'; }
      }
      .dot-anim:after {
          content: "";
          animation: dotPulse 2s ease-in-out infinite;
          animation-timing-function: step-end;
      }

    </style>

</div>`;
      break;
    case RunningStatus.Generating:
      container.style.display = 'block';
      container.innerHTML = `<div style="width: 100%; height: 100%; position: relative;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      ${loadingSvg}
      <div class="dot-anim" style="margin-top: 0; width: 280px; color: white">正在根据职位描述生成问候语， 可能需要 10 - 30 秒</div>
    </div>

    <style>
      @keyframes dotPulse {
          0% { content: '.'; }
          25% { content: '..'; }
          50% { content: '...'; }
          75% { content: '..'; }
          100% { content: '.'; }
      }
      .dot-anim:after {
          content: "";
          animation: dotPulse 2s ease-in-out infinite;
          animation-timing-function: step-end;
      }

    </style>

</div>`;
      break;
    default:
  }
};
