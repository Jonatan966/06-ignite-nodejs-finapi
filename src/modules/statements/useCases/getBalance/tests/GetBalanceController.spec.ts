import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("pass", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password)
      VALUES('${id}', 'User', 'user@email.com', '${password}')
      `
    );

    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type)
      VALUES('${uuidv4()}', '${id}', 'The deposit', 250, 'deposit')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "pass",
    });

    const { token } = tokenResponse.body;

    const balanceResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toHaveProperty("balance", 250);
  });
});
