import { faker } from '@faker-js/faker';

const gameTestingData = {
  gameName: faker.datatype.string(),
  introduction: faker.datatype.string(),
  gameId: faker.datatype.uuid(),
  gameFile: faker.datatype.json(),
  providerId: faker.datatype.uuid()
};

export default gameTestingData;
