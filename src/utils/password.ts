import crypto from 'crypto';
import { env } from "~/env";

// 使用 crypto 模块和 PBKDF2 算法对密码进行加密
export function encryptPassword(password: string, salt = env.ENCRYPTION_KEY): string {
  const keylen = 64; // 生成的密钥长度
  const iterations = 10000; // 迭代次数
  const digest = 'sha512'; // 摘要算法

  const encryptedPassword = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');

  return encryptedPassword;
}