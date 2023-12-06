const { PrismaClient } = require('@prisma/client')
const prismaPost = new PrismaClient()

const prismaCreate = async(title, comment, image, posted) => {
    console.log(image)
try {
  const newPost = await prismaPost.posts.create({
      data: {
        title,
        comment,
        image,
        posted
      },
  });

  console.log(image)
  console.log('post created:', newPost);
  return newPost;
} catch (error) {
  console.error('Error creating post:', error);
  throw error;
}
}

module.exports = {prismaCreate};
