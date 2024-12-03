use aes::Aes128;
use base64::{engine::general_purpose, Engine}; // 引入 Engine
use block_modes::block_padding::Pkcs7;
use block_modes::{BlockMode, Cbc};
use std::collections::BTreeMap;

type Aes128Cbc = Cbc<Aes128, Pkcs7>;

/// 自定义的 `encode` 函数，实现 AES 加密
pub fn encode(params: &BTreeMap<String, String>) -> String {
  // 按照键进行字典排序
  let mut keys: Vec<String> = params.keys().cloned().collect();
  keys.sort_unstable();

  // 创建一个有序的记录
  let mut record = BTreeMap::new();
  for key in keys {
    record.insert(key.clone(), params[&key].clone());
  }

  // 将参数转化为查询字符串格式
  let text = record
    .iter()
    .map(|(k, v)| format!("{}={}", k, v))
    .collect::<Vec<String>>()
    .join("&");

  // AES 密钥和 IV
  let key: &[u8; 16] = b")(13daqP@ssw0rd~"; // 128-bit key
  let iv: [u8; 16] = [0u8; 16]; // 使用全零 IV，可以根据实际需要调整

  // 使用 AES CBC 模式加密数据
  let cipher = Aes128Cbc::new_from_slices(key, &iv).unwrap();
  let encrypted_data = cipher.encrypt_vec(text.as_bytes());

  // 使用 `base64::engine::general_purpose` 来编码
  general_purpose::STANDARD.encode(&encrypted_data) // 使用推荐的 API
}

/// 获取缓存的 key
pub fn get_cache_key(id: &str) -> String {
  // 构建参数
  let mut params = BTreeMap::new();
  params.insert("id".to_string(), id.to_string());
  params.insert("e_r".to_string(), "true".to_string());

  // 使用自定义的 `encode` 函数生成缓存 key
  encode(&params)
}
