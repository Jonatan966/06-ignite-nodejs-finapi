import { InMemoryUsersRepository } from "../../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../../entities/Statement";
import { InMemoryStatementsRepository } from "../../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferStatementError } from "../CreateTransferStatementError";
import { CreateTransferStatementUseCase } from "../CreateTransferStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createTransferStatementUseCase: CreateTransferStatementUseCase;

describe("Create Transfer Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createTransferStatementUseCase = new CreateTransferStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to transfer founds", async () => {
    const receiverUser = await inMemoryUsersRepository.create({
      email: "titacun@lojzuvlaz.io",
      name: "Ida Cox",
      password: "the-pass",
    });

    await inMemoryStatementsRepository.create({
      amount: 500,
      description: "The first deposit",
      type: OperationType.DEPOSIT,
      user_id: "the-sender-id",
    });

    const transferResult = await createTransferStatementUseCase.execute({
      amount: 300,
      description: "The first transfer",
      receiver_id: receiverUser.id as string,
      sender_id: "the-sender-id",
    });

    expect(transferResult).toHaveProperty("id");

    const receiverBalance = await inMemoryStatementsRepository.getUserBalance({
      user_id: receiverUser.id as string,
    });

    expect(receiverBalance).toHaveProperty("balance", 300);

    const senderBalance = await inMemoryStatementsRepository.getUserBalance({
      user_id: "the-sender-id",
    });

    expect(senderBalance).toHaveProperty("balance", 200);
  });

  it("should not be able to transfer if user not have funds", async () => {
    const receiverUser = await inMemoryUsersRepository.create({
      email: "redwavru@rizsi.tw",
      name: "Maude Hubbard",
      password: "the-pass",
    });

    await expect(
      createTransferStatementUseCase.execute({
        amount: 300,
        description: "The first transfer",
        receiver_id: receiverUser.id as string,
        sender_id: "the-sender-id",
      })
    ).rejects.toBeInstanceOf(CreateTransferStatementError.InsufficientFunds);
  });

  it("should not be able to transfer if receiver user not exists", async () => {
    await expect(
      createTransferStatementUseCase.execute({
        amount: 300,
        description: "The first transfer",
        receiver_id: "inexistent-receiver",
        sender_id: "the-sender-id",
      })
    ).rejects.toBeInstanceOf(CreateTransferStatementError.ReceiverNotFound);
  });
});
