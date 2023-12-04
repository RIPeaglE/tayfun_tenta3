const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (username, password, roll) =>  {
    try {
        const newUser = await prisma.user.create({
            data: {
                username: username,
                password: password,
                roll: roll,
            },
        });

        console.log('User created:', newUser);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

module.exports = {
    createUser,
};
