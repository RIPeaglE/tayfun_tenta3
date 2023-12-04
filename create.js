const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const prismaCreate = async(username, password, roll) => {
try {
  const newUser = await prisma.user.create({
      data: {
          username,
          password,
          roll,
      },
  });

  console.log('User created:', newUser);
  return newUser;
} catch (error) {
  console.error('Error creating user:', error);
  throw error;
}
}

module.exports = {prismaCreate};
