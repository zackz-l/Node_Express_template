import { Container } from "inversify";

import TYPES from "../domain/constants/types";
import AuthRepository from "../infrastructure/repositories/auth";
import AuthService from "../domain/services/auth";
import { IAuthRepository } from "../domain/aggregates/auth/auth-repository";
import { ITokenUtilities } from "../domain/contracts/token-utilities";
import TokenUtilities from "../infrastructure/token-utilities/jwt-token";
import { IEmailSender } from "../domain/contracts/email-sender";
import EmailSender from "../infrastructure/email-sender/email-sender";
import { IFileStorage } from "../domain/contracts/file-storage";
import FileStorage from "../infrastructure/file-storage/file-storage";
import UserService from "../domain/services/user";
import { IUserRepository } from "../domain/aggregates/users/user-repository";
import UserRepository from "../infrastructure/repositories/user";

const container: Container = new Container();

container.bind<UserService>(UserService).toSelf();
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<AuthService>(AuthService).toSelf();
container.bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository);
container.bind<ITokenUtilities>(TYPES.TokenUtilities).to(TokenUtilities);
container.bind<IEmailSender>(TYPES.EmailSender).to(EmailSender);

container.bind<IFileStorage>(TYPES.FileStorage).to(FileStorage);

export { container };
