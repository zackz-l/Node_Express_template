import bcrypt from 'bcryptjs';

export const hash = (content: string): string => bcrypt.hashSync(content, bcrypt.genSaltSync(12));

export const compare = (content: string, record: string): boolean => bcrypt.compareSync(content, record);
