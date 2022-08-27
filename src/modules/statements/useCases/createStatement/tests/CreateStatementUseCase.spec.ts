import { InMemoryUsersRepository } from "../../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../../entities/Statement";
import { InMemoryStatementsRepository } from "../../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../CreateStatementError";
import { CreateStatementUseCase } from "../CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to deposit", async () => {
    const fakeUser = await inMemoryUsersRepository.create({
      email: "the-user@email.com",
      name: "User",
      password: "the-pass",
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(fakeUser.id),
      amount: 123,
      description: "The statement",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should be able to withdraw", async () => {
    const fakeUser = await inMemoryUsersRepository.create({
      email: "the-user@email.com",
      name: "User",
      password: "the-pass",
    });

    await createStatementUseCase.execute({
      user_id: String(fakeUser.id),
      amount: 123,
      description: "The statement",
      type: OperationType.DEPOSIT,
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(fakeUser.id),
      amount: 100,
      description: "The statement",
      type: OperationType.WITHDRAW,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create statement if user not found", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "inexistent-user",
        amount: 123,
        description: "The statement",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw if not have suficient balance", async () => {
    const fakeUser = await inMemoryUsersRepository.create({
      email: "the-user@email.com",
      name: "User",
      password: "the-pass",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: String(fakeUser.id),
        amount: 123,
        description: "The statement",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
