import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../../app";

let connection: Connection;
const senderUserId = uuidv4();
const receiverUserId = uuidv4();

describe("Create Transfer Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("pass", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password)
      VALUES('${senderUserId}', 'Sender User', 'sender@email.com', '${password}')
      `
    );

    await connection.query(
      `INSERT INTO users(id, name, email, password)
      VALUES('${receiverUserId}', 'Receiver User', 'receiver@email.com', '${password}')
      `
    );

    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type)
      VALUES('${uuidv4()}', '${senderUserId}', 'The deposit', 500, 'deposit')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to transfer funds to another user", async () => {
    const senderUserTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "pass",
      });

    const { token: senderUserToken } = senderUserTokenResponse.body;

    const transferResponse = await request(app)
      .post(`/api/v1/statements/transfers/${receiverUserId}`)
      .send({
        amount: 300,
        description: "The first transfer",
      })
      .set({
        Authorization: `Bearer ${senderUserToken}`,
      });

    expect(transferResponse.status).toBe(201);

    const senderBalanceResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${senderUserToken}`,
      });

    expect(senderBalanceResponse.body).toHaveProperty("balance", 200);

    const receiverUserTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receiver@email.com",
        password: "pass",
      });

    const { token: receiverUserToken } = receiverUserTokenResponse.body;

    const receiverBalanceResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${receiverUserToken}`,
      });

    expect(receiverBalanceResponse.body).toHaveProperty("balance", 300);
  });

  it("should not be able to transfer if sender user not have suficient funds", async () => {
    const senderUserTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "pass",
      });

    const { token: senderUserToken } = senderUserTokenResponse.body;

    const transferResponse = await request(app)
      .post(`/api/v1/statements/transfers/${receiverUserId}`)
      .send({
        amount: 500,
        description: "The second transfer",
      })
      .set({
        Authorization: `Bearer ${senderUserToken}`,
      });

    expect(transferResponse.status).toBe(400);
  });

  it("should not be able to transfer if receiver user not exists", async () => {
    const senderUserTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "pass",
      });

    const { token: senderUserToken } = senderUserTokenResponse.body;

    const transferResponse = await request(app)
      .post(`/api/v1/statements/transfers/${uuidv4()}`)
      .send({
        amount: 300,
        description: "The first transfer",
      })
      .set({
        Authorization: `Bearer ${senderUserToken}`,
      });

    expect(transferResponse.status).toBe(404);
  });
});
