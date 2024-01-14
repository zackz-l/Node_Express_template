import { faker } from '@faker-js/faker';

const postTestingData = {
  userId: faker.datatype.string(),
  title: faker.datatype.string(),
  content: faker.datatype.string(),
  postId: faker.datatype.uuid(),
  newTitle: faker.datatype.string(),
  newContent: faker.datatype.string(),
  commentId: faker.datatype.uuid(),
  newCommentContent: faker.datatype.string(),
  subCommentId: faker.datatype.uuid(),
  pageIndex: faker.datatype.number({ min: 1 }),
  pageLimit: faker.datatype.number({ min: 1, max: 10 }),
  delteAt: faker.datatype.datetime(),
  postPath: faker.datatype.string(),
  imageBuffer: new Buffer(faker.image.nature(), 'base64')
};

export default postTestingData;
