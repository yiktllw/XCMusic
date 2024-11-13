/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * render_storage.ts 为在渲染进程中存储数据相关功能
 * 主要包装了localStorage，用于将数据JSON化，以防类型丢失
 *---------------------------------------------------------------*/

interface IData {
  data: any;
}

/**
 * 从localStorage中存储数据
 */
export function setStorage(key: string, value: any) {
  const data: IData = {
    data: value,
  };
  localStorage.setItem(key, JSON.stringify(data, null, 4));
}

/**
 * 从localStorage中获取数据
 */
export function getStorage(key: string): null | any {
  const value = localStorage.getItem(key);
  if (!value) {
    setStorage(key, null);
    return null;
  }
  let data: IData;
  try {
    data = JSON.parse(value);
  } catch (error) {
    console.error("解析数据失败", error);
    setStorage(key, null);
    return null;
  }
  if (typeof data === 'object' && "data" in data) {
    return data.data;
  } else {
    setStorage(key, null);
    return null;
  }
}
