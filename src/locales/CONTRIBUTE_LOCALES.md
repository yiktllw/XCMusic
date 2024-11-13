## 新增语言

- 运行`create_template_from_en.js`，这会从en.json创建一个新的模板文件`template.json`。
- 在对应的键值处写入翻译内容。
- 在`src/views/YsettingView.vue`的语言设置项处添加新的语言。

## 新增翻译内容

- 在`en.json`写入键值。
- 运行`sort.js`，将键名按字母排序。
- 运行`sync_key.js`，将新增的键同步到`zh.json`。
- 在`zh.json`中，查找值为`TO_BE_TRANSLATED`的键，并填入中文翻译。
