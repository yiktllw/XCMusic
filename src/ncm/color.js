import Color from "color";

const darkThemeColors = [ // eslint-disable-line
    '#1d2932',
    '#3c4871',
    '#405772',
    '#425d72',
    '#486f63',
    '#4b3c71',
    '#4d6e45',
    '#576f46',
    '#583d71',
    '#5c6f45',
    '#5d3d71',
    '#5e6f45',
    '#673e71',
    '#693c4b',
    '#6a3d60',
    '#6a423f',
    '#6d5a42',
    '#6e6544',
    '#6f6845',
    '#707046',
]

export function setColorFromImg(imgSrc, document) {
    getColorFromImg(imgSrc, document).then((color) => {
        if (color) {
            setBackgroundColor(color);
        } else {
            setBackgroundColor({ r: 19, g: 19, b: 25 });
        }
    });
}

export function setBackgroundColor(color) {
    const DOM = document.querySelector('.mainContainer');
    if (!DOM) return;
    DOM.style.background = `linear-gradient(180deg, rgb(${color.r}, ${color.g}, ${color.b}) 0%,  #131319 500px, #131319 100%)`;
}

export function setBackgroundColorHex(hex) {
    const DOM = document.querySelector('.mainContainer');
    if (!DOM) return;
    DOM.style.background = `linear-gradient(180deg, ${hex} 0%,  #131319 500px, #131319 100%)`;
}

function increaseSaturation(r, g, b,) { // eslint-disable-line
    // 创建一个 Color 对象
    const color = Color.rgb(r, g, b);

    // 获取 HSL 颜色
    let hsl = color.hsl();
    // 使用平方根函数增加饱和度
    let newHsl = hsl.saturationl(20 + 3 * Math.sqrt(hsl.saturationl()));

    // 获取新的 RGB 值
    const [newR, newG, newB] = newHsl.rgb().array();
    // 返回新的 RGB 值
    return { r: Math.round(newR), g: Math.round(newG), b: Math.round(newB) };
}

export async function getColorFromImg(imgSrc, document) {
    // 创建一个图片对象
    // console.log('step1');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    // 设置图片 URL为歌单封面
    img.src = imgSrc;
    if (!img.src) return;
    // console.log('step2');
    // console.log(img);

    // 使用 Promise 包装 img.onload
    const color = await new Promise((resolve, reject) => {
        // 图片加载完成后执行
        img.onload = () => {
            try {
                // console.log('step3');
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);

                // console.log('step4');
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let r = 0, g = 0, b = 0;
                let count = 0;
                const threshold = 30;

                // 遍历图片的每个像素
                for (let i = 0; i < data.length; i += 4) {
                    const pixelR = data[i];
                    const pixelG = data[i + 1];
                    const pixelB = data[i + 2];
                    const pixelA = data[i + 3];

                    const maxRGB = Math.max(pixelR, pixelG, pixelB);
                    const minRGB = Math.min(pixelR, pixelG, pixelB);
                    const rgbDifference = maxRGB - minRGB;

                    if (rgbDifference >= threshold && pixelA > 0) {
                        r += pixelR;
                        g += pixelG;
                        b += pixelB;
                        count++;
                    }
                }

                if (count === 0) {
                    resolve(null); // 防止除以零的情况
                    return;
                }

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                let increasedData = increaseSaturation(r, g, b);
                r = increasedData.r * 0.5;
                g = increasedData.g * 0.5;
                b = increasedData.b * 0.5;

                const avgColor = { r, g, b };
                let closestColor = darkThemeColors[0];
                let minDistance = colorDistance(avgColor, hexToRgb(closestColor));

                for (const color of darkThemeColors) {
                    const colorRgb = hexToRgb(color);
                    const distance = colorDistance(avgColor, colorRgb);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestColor = color;
                    }
                }
                console.log('color of img', avgColor, '\nclosestColor', closestColor);

                resolve(hexToRgb(closestColor)); // 通过 resolve 返回计算结果
            } catch (error) {
                reject(error); // 如果有错误，通过 reject 传递错误
            }
        };

        img.onerror = (error) => {
            reject(error); // 处理图片加载错误
        };
    }).catch((error) => {
        console.error('get color from image error: ', error); // 捕获错误
    });

    // console.log('color of img', color);
    return color; // 返回结果
}

export function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function colorDistance(color1, color2) {
    // 计算两个颜色之间的欧几里得距离
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}