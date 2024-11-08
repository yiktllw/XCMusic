/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * rust.ts是一些Rust语言特性的TypeScript实现
*-----------------------------------------*/

// 定义 Result<T, E>
/** Ok<T> 表示成功，包含一个值 */
type Ok<T> = { ok: true; value: T };
/** Err<T> 表示错误，包含错误内容 */
type Err = { ok: false; error: string };
/** Result<T, E> 表示可能是成功也可能是错误的结果 */
type Result<T> = Ok<T> | Err;
/** Ok<T> 的构造函数 */
function Ok<T>(value: T): Ok<T> {
    return { ok: true, value };
}
/** Err<E> 的构造函数 */
function Err(error: string): Err {
    return { ok: false, error };
}

// 定义 Option<T>
/** Some<T> 表示有值，包含一个值 */
type Some<T> = { isSome: true; value: T };
/** None 表示没有值 */
type None = { isSome: false };
/** Option<T> 表示可能有值也可能没有值 */
type Option<T> = Some<T> | None;
/** Some<T> 的构造函数 */
function Some<T>(value: T): Option<T> {
    return { isSome: true, value };
}
/** None 的构造函数 */
function None<T>(): Option<T> {
    return { isSome: false };
}

// 四则运算
function getValidNumber(a: number | Result<number>, err: Err): number {
    if (typeof a === "object") {
        if (a.ok) {
            return a.value;
        } else {
            err.error = a.error;
            return NaN;
        }
    } else {
        return a;
    }
}
/** 加法 */
function Add(_a: number | Result<number>, _b: number | Result<number>): Result<number> {
    var a: number, b: number, err = Err('');
    a = getValidNumber(_a, err);
    b = getValidNumber(_b, err);
    if (err.error !== '') return err;
    if (isNaN(a + b)) return Err("Addition Error: a: " + a + " b: " + b);
    return Ok(a + b);
}
/** 减法 */
function Sub(_a: number, _b: number): Result<number> {
    var a: number, b: number, err = Err('');
    a = getValidNumber(_a, err);
    b = getValidNumber(_b, err);
    if (err.error !== '') return err;
    if (isNaN(a - b)) return Err("Subtraction Error: a: " + a + " b: " + b);
    return Ok(a - b);
}
/** 乘法 */
function Mul(_a: number, _b: number): Result<number> {
    var a: number, b: number, err = Err('');
    a = getValidNumber(_a, err);
    b = getValidNumber(_b, err);
    if (err.error !== '') return err;
    if (isNaN(a * b)) return Err("Multiplication Error: a: " + a + " b: " + b);
    return Ok(a * b);
}
/** 除法 */
function Div(_a: number, _b: number): Result<number> {
    if (_b === 0) return Err("Division Error: b is zero");
    var a: number, b: number, err = Err('');
    a = getValidNumber(_a, err);
    b = getValidNumber(_b, err);
    if (err.error !== '') return err;
    if (isNaN(a / b)) return Err("Division Error: a: " + a + " b: " + b);
    return Ok(a / b);
}

export { Ok, Err, Result, Some, None, Option, Add, Sub, Mul, Div };