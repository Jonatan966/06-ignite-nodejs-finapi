import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO = Pick<
  Statement,
  "user_id" | "description" | "amount" | "type"
> &
  Partial<Pick<Statement, "sender_id">>;
