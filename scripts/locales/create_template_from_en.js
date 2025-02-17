/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * 本脚本用于从en.json生成模板文件 template.json
 *---------------------------------------------------------------*/

const fs = require("fs");

// 递归函数：遍历对象并生成模板
function createTemplate(obj) {
  const template = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        // 如果是对象，则递归调用
        template[key] = createTemplate(obj[key]);
      } else {
        // 否则设置为 ''
        template[key] = "";
      }
    }
  }
  return template;
}

// 读取 en.json 文件
fs.readFile("./src/locales/en.json", "utf8", (err, data) => {
  if (err) {
    console.error("读取文件出错:", err);
    return;
  }

  // 解析 JSON 数据
  const jsonData = JSON.parse(data);

  // 生成模板
  const template = createTemplate(jsonData);

  // 将模板写入新的 JSON 文件
  fs.writeFile(
    "./src/locales/template.json",
    JSON.stringify(template, null, "\t"),
    (err) => {
      if (err) {
        console.error("写入文件出错:", err);
        return;
      }
      console.log("模板文件已成功创建: template.json");
    },
  );
});
