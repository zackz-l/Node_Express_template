import { EMAIL_REGEX } from '../../constants/regex';
import { hash, compare } from '../../../infrastructure/hash/hash';

export default class LoginUser {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public password: string,
    public readonly id: string,
    public readonly type?: string
  ) {}

  public checkPassword(password: string): boolean {
    return compare(password, this.password);
  }

  public static validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  public updatePassword(password: string): void {
    this.password = hash(password);
  }
}
