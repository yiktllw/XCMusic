const sourceFileName = './src/locales/en.json';
const targetFileName = './src/locales/zh.json';

const fs = require('fs');

// 读取指定的 JSON 文件
function readJsonFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                reject(`读取文件 ${fileName} 出错: ${err}`);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

// 写入 JSON 文件
function writeJsonFile(fileName, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, JSON.stringify(data, null, '\t'), (err) => {
            if (err) {
                reject(`写入文件 ${fileName} 出错: ${err}`);
            } else {
                resolve(`文件 ${fileName} 已成功更新`);
            }
        });
    });
}

// 递归复制键值并排序的函数
function syncKeysAndSort(source, target) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // 如果目标文件中没有该键，则创建一个新键，值为 ''
            if (!(key in target) && typeof source[key] !== 'object') {
                target[key] = 'TO_BE_TRANSLATED';
            }
            // 如果值是对象，则递归调用
            if (typeof source[key] === 'object' && source[key] !== null) {
                target[key] = target[key] || {}; // 确保目标是对象
                syncKeysAndSort(source[key], target[key]);
            }
        }
    }

    // 对当前对象的键进行排序
    const sortedTarget = {};
    Object.keys(target)
        .sort()
        .forEach((key) => {
            if (typeof target[key] === 'object' && target[key] !== null) {
                // 对嵌套的对象再做一次排序
                sortedTarget[key] = syncKeysAndSort(source[key] || {}, target[key]);
            } else {
                sortedTarget[key] = target[key];
            }
        });

    // 返回排序后的对象
    return sortedTarget;
}

// 主函数
async function main(sourceFile, targetFile) {
    try {
        const sourceData = await readJsonFile(sourceFile);
        let targetData = await readJsonFile(targetFile);

        // 复制并合并键值，然后返回排序后的目标对象
        targetData = syncKeysAndSort(sourceData, targetData);

        await writeJsonFile(targetFile, targetData);
        console.log(`已成功将 ${sourceFile} 的结构复制到 ${targetFile} 并按首字母排序`);
    } catch (error) {
        console.error(error);
    }
}

// 调用主函数
if (sourceFileName && targetFileName) {
    main(sourceFileName, targetFileName);
}