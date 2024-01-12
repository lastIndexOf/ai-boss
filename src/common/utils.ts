export const sleep = (timer: number) =>
  new Promise((resolve) => setTimeout(resolve, timer));

export const queryUntilNotNull = async (selector: string) => {
  let res = document.querySelector(selector);

  while (!res) {
    await sleep(1000);
    res = document.querySelector(selector);
  }

  return res;
};

export const jumpToPage = async (dom: HTMLDivElement, page: number) => {
  let currentPage = 1;

  while (currentPage < page) {
    // 触发加载
    dom.scrollTo(0, dom.scrollHeight);

    while (dom.scrollTop + 200 > dom.scrollHeight) {
      await sleep(500);
    }

    currentPage += 1;
  }
};
