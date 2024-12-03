mod util;

fn main() {
  println!("Hello, world!");
  let result = util::cache_key::get_cache_key("123");
  println!("result: {}", result);
}
