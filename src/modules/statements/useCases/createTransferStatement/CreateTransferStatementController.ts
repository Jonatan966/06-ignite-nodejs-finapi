import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

class CreateTransferStatementController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { receiver_id } = request.params;
    const { amount, description } = request.body;

    const createTransferStatementUseCase = container.resolve(
      CreateTransferStatementUseCase
    );

    const statementResult = await createTransferStatementUseCase.execute({
      amount,
      description,
      receiver_id,
      sender_id: request.user.id,
    });

    return response.status(201).json(statementResult);
  }
}

export { CreateTransferStatementController };
