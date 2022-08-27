import { InMemoryUsersRepository } from "../../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../../entities/Statement";
import { InMemoryStatementsRepository } from "../../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "../GetStatementOperationError";
import { GetStatementOperationUseCase } from "../GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "get-statement-user@email.com",
      name: "Statement User",
      password: "the-pass",
    });

    const createdStatement = await inMemoryStatementsRepository.create({
      amount: 125,
      description: "The statement",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: String(createdStatement.id),
      user_id: String(user.id),
    });

    expect(statementOperation).toEqual(createdStatement);
  });

  it("should not be able to get statement operation of a inexistent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "inexistent-user",
        statement_id: "the-statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get inexistent statement operation", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "get-statement-user@email.com",
        name: "Statement User",
        password: "the-pass",
      });

      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: "inexistent-statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should not be able to get statement of another user", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "get-statement-user@email.com",
        name: "Statement User",
        password: "the-pass",
      });

      const anotherUser = await inMemoryUsersRepository.create({
        email: "another-user@email.com",
        name: "Another User",
        password: "the-pass",
      });

      const createdStatement = await inMemoryStatementsRepository.create({
        amount: 125,
        description: "The statement",
        type: OperationType.DEPOSIT,
        user_id: String(anotherUser.id),
      });

      await getStatementOperationUseCase.execute({
        statement_id: String(createdStatement.id),
        user_id: String(user.id),
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
