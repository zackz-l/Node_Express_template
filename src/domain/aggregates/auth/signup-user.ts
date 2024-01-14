import { hash } from '../../../infrastructure/hash/hash';

export default class SignupUser {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public password: string,
    public readonly id?: string
  ) {}

  public async hashingPassword(): Promise<void> {
    this.password = hash(this.password);
  }
}
