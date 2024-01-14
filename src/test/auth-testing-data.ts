import { faker } from '@faker-js/faker';

const authTestingData = {
  userId: faker.datatype.uuid(),
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  wrongPassword: faker.internet.password(),
  newPassword: faker.internet.password(),
  sessionId: faker.datatype.uuid(),
  newName: faker.internet.userName(),
  postCount: faker.datatype.number(),
  providerId: faker.datatype.uuid(),
  providerSessionId: faker.datatype.uuid(),
  providerPasscode: faker.datatype.string(),
  userToken: faker.datatype.string(),
  followedUserId: faker.datatype.string()
};

export default authTestingData;
