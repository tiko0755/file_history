import crypto from 'crypto';

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      100000,       // 迭代次数
      64,            // 密钥长度（字节）
      'sha512',      // 哈希算法
      (err, derivedKey) => {
        if (err) reject(err);
        resolve({
          salt,
          hash: derivedKey.toString('hex')
        });
      }
    );
  });
}

async function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      100000,
      64,
      'sha512',
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(hash === derivedKey.toString('hex'));
      }
    );
  });
}

// 哈希密码
async function createUser(username, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await hashPassword(password, salt);
  
  return {
    username,
    salt: hash.salt,
    passwordHash: hash.hash
  };
}

// 验证密码
async function authenticateUser(user, password) {
  return await verifyPassword(password, user.passwordHash, user.salt);
}

export {
  hashPassword,
  verifyPassword,
  createUser,
  authenticateUser
}

