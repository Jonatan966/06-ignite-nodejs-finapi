import { InMemoryUsersRepository } from "../../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../../entities/Statement";
import { InMemoryStatementsRepository } from "../../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "../GetBalanceError";
import { GetBalanceUseCase } from "../GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "the-balance-user@email.com",
      name: "Balance User",
      password: "pass",
    });

    await inMemoryStatementsRepository.create({
      amount: 100,
      description: "The deposit",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
    });

    await inMemoryStatementsRepository.create({
      amount: 50,
      description: "The withdraw",
      type: OperationType.WITHDRAW,
      user_id: String(user.id),
    });

    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    expect(balance).toHaveProperty("balance", 50);
    expect(balance.statement).toHaveLength(2);
  });

  it("should not be able to get balance if user not exists", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "nonexistent-user",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
