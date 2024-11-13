/**
 * 节流函数
 */
export function throttle(func: Function, delay: number) {
  let lastTime = 0; // 上次执行时间

  return function (...args: any[]) {
    const now = Date.now();

    // 如果距离上次执行的时间小于 delay，直接返回
    if (now - lastTime < delay) {
      return;
    }

    // 执行目标函数，并更新 lastTime
    lastTime = now;
    func(...args);
  };
}
