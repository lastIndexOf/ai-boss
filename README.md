  
# AI Boss

让 gpt 根据你的简历和预期的职位介绍自动生成问候语，并自动投递简历的浏览器插件。灵感来自 [auto_job__find__chatgpt__rpa](https://github.com/Frrrrrrrrank/auto_job__find__chatgpt__rpa)

## 使用演示
  
  ![演示](/public/ai-boss-demo.gif)
  
## TODO

- [x] [💡] 新增从 boss 内站打开的逻辑
- [x] [💡] 增加 OpenAI Model 设置选项
- [x] [💡] 没有期望岗位时给出提示并自动跳转
- [x] [💡] 优化 prompt 和流程
- [x] [🐛] 传简历的时候如果刷新了页面，那么上传简历的状态将一直保留，需要一个重置的按钮
- [x] [🐛] 传简历如果点了取消，也会一直loading
- [x] [🐛] 如果用户不是从 boss 「推荐岗位」的页面进来的，会有未定义的行为，兼容一下
- [ ] [📅] 发送完简历回退到上一页时会丢失分页的状态，feed 流每次拉取的内容都不一致，需要兼容
- [ ] [📅] 支持 Firefox
- [ ] [📅] 支持 Safari
- [ ] [📅] 发布到 Chrome Extension Store
- [ ] [📅] 发布到 Firefox Extension Store
- [ ] [📅] more

## Installation

// TODO

## Development

```bash
pnpm install
pnpm run watch
````

## License

`AI Boss` are authored by Google and are licensed under the [Apache License, Version 2.0](/LICENSE).
