/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * rust.ts是一些Rust语言特性的TypeScript实现
*-----------------------------------------*/

// 定义 Result<T, E>
/** Ok<T> 表示成功，包含一个值 */
export type Ok<T> = { ok: true; value: T };
/** Err<T> 表示错误，包含错误内容 */
export type Err<E> = { ok: false; error: E };
/** Result<T, E> 表示可能是成功也可能是错误的结果 */
export type Result<T, E> = Ok<T> | Err<E>;
/** Ok<T> 的构造函数 */
export function Ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}
/** Err<E> 的构造函数 */
export function Err<E>(error: E): Result<never, E> {
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