import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError";

interface IRequest {
  amount: number;
  description: string;
  sender_id: string;
  receiver_id: string;
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ amount, description, receiver_id, sender_id }: IRequest) {
    const userReceiver = await this.usersRepository.findById(receiver_id);

    if (!userReceiver) {
      throw new CreateTransferStatementError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance < amount) {
      throw new CreateTransferStatementError.InsufficientFunds();
    }

    const statementOperation = await this.statementsRepository.create({
      amount,
      description,
      sender_id,
      user_id: receiver_id,
      type: OperationType.TRANSFER,
    });

    return statementOperation;
  }
}

export { CreateTransferStatementUseCase };
