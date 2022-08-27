import "dotenv/config";
import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "../IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate user", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "foo@bar.com",
      name: "Foo Bar",
      password: await hash("auth-pass", 8),
    });

    const authResponse = await authenticateUserUseCase.execute({
      email: "foo@bar.com",
      password: "auth-pass",
    });

    expect(authResponse).toHaveProperty("token");
    expect(authResponse).toHaveProperty("user");
    expect(authResponse.user).toHaveProperty("id", user.id);
  });

  it("should not be able to authenticate user with wrong email", () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        email: "doe@user.com",
        name: "Doe",
        password: await hash("auth-pass", 8),
      });

      await authenticateUserUseCase.execute({
        email: "wrong-email@user.com",
        password: "auth-pass",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate user with wrong password", () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        email: "john@user.com",
        name: "John",
        password: await hash("auth-pass", 8),
      });

      await authenticateUserUseCase.execute({
        email: "john@user.com",
        password: "wrong-pass",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
