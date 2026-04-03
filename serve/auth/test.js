const {
  createUser,
  authenticateUser
} = require('./index');

// 使用示例
(async () => {

  let tiko = await createUser('tiko', '123456');
  console.log('Stored tiko:', tiko);

  let user = await createUser('jim', '123456');
  console.log('Stored jim:', user);

  user = await createUser('lilei', '123456');
  console.log('Stored lilei:', user);

  user = await createUser('lily', '123456');
  console.log('Stored lily:', user);

  user = await createUser('lucy', '123456');
  console.log('Stored lucy:', user);

  user = await createUser('alice', 'mySecurePassword123');
  console.log('Stored user:', user);
  
  let isValid = await authenticateUser(user, 'mySecurePassword123');
  console.log('Password valid:', isValid); // true

  isValid = await authenticateUser(tiko, '123456');
  console.log('Password valid tiko:', isValid); // true

  const isWrongValid = await authenticateUser(user, 'wrongPassword');
  console.log('Wrong password valid:', isWrongValid); // false

})();