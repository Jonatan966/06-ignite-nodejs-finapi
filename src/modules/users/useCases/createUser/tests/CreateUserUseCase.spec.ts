import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "../CreateUserError";
import { CreateUserUseCase } from "../CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create user", async () => {
    const user = await createUserUseCase.execute({
      email: "the-new-user@email.com",
      name: "User",
      password: await hash("the-pass", 8),
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create user if already exists", () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "clone-user@email.com",
        name: "User",
        password: await hash("the-pass", 8),
      });

      await createUserUseCase.execute({
        email: "clone-user@email.com",
        name: "User",
        password: await hash("the-pass", 8),
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
