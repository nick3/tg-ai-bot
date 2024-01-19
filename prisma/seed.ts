// seed.ts
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto';

// 使用 crypto 模块和 PBKDF2 算法对密码进行加密
export function encryptPassword(password: string): string {
  const keylen = 64; // 生成的密钥长度
  const iterations = 10000; // 迭代次数
  const digest = 'sha512'; // 摘要算法
  const salt = process.env.ENCRYPTION_KEY ?? 'tgaibot';

  const encryptedPassword = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');

  return encryptedPassword;
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      passwordHash: encryptPassword('admin'),
      name: 'admin',
    },
  });
  console.log(user);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });