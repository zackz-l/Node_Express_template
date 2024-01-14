import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
  NumberDictionary
} from 'unique-names-generator';
const numberDictionary = NumberDictionary.generate({ min: 1000, max: 9999 });

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals, numberDictionary],
  separator: '',
  style: 'capital'
};

export const generateUsername = (): string =>
  uniqueNamesGenerator(customConfig);
