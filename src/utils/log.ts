
export function log(...args: any[]){
  let msg = '';
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] === 'object' || Array.isArray(args[i])) {
      msg += JSON.stringify(args[i], null, 4);
    } else if (typeof args[i] === 'function') {
      msg += args[i].toString();
    } else {
      msg += args[i];
    }
  }
  console.log(msg);
}