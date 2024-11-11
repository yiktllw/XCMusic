/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * 本文件用于对 JSON 文件的键进行排序
*-----------------------------------------*/

const fs = require('fs');

// 指定需要排序的 JSON 文件路径
const jsonFilePath = './src/locales/en.json'; 

// 读取指定的 JSON 文件
function readJsonFile(fileName) {
    try {
        const data = fs.readFileSync(fileName, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`读取文件 ${fileName} 出错: ${err}`);
        process.exit(1);
    }
}

// 写入 JSON 文件
function writeJsonFile(fileName, data) {
    try {
        fs.writeFileSync(fileName, JSON.stringify(data, null, '\t'));
        console.log(`文件 ${fileName} 已成功更新`);
    } catch (err) {
        console.error(`写入文件 ${fileName} 出错: ${err}`);
        process.exit(1);
    }
}

// 递归排序对象的键
function sortObjectKeys(obj) {
    const sortedObj = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                // 如果值是嵌套对象，则递归排序
                sortedObj[key] = sortObjectKeys(obj[key]);
            } else {
                sortedObj[key] = obj[key];
            }
        });
    return sortedObj;
}

// 读取 JSON 文件
const jsonData = readJsonFile(jsonFilePath);

// 对 JSON 的键值进行排序
const sortedData = sortObjectKeys(jsonData);

// 写回 JSON 文件
writeJsonFile(jsonFilePath, sortedData);