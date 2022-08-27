import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../../app";

let connection: Connection;
let mainStatementId: string;
let anotherStatementId: string;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const mainUserId = uuidv4();
    const password = await hash("pass", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password)
      VALUES('${mainUserId}', 'User', 'user@email.com', '${password}')
      `
    );

    const anotherUserId = uuidv4();

    await connection.query(
      `INSERT INTO users(id, name, email, password)
      VALUES('${anotherUserId}', 'Another User', 'another@email.com', '${password}')
      `
    );

    mainStatementId = uuidv4();

    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type)
      VALUES('${mainStatementId}', '${mainUserId}', 'The deposit', 250, 'deposit')
      `
    );

    anotherStatementId = uuidv4();

    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type)
      VALUES('${anotherStatementId}', '${anotherUserId}', 'The another deposit', 250, 'deposit')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "pass",
    });

    const { token } = tokenResponse.body;

    const statementResponse = await request(app)
      .get(`/api/v1/statements/${mainStatementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(200);
    expect(statementResponse.body).toHaveProperty("id", mainStatementId);
    expect(statementResponse.body).toHaveProperty("amount", "250.00");
  });

  it("should not be able get inexistent statement operation", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "pass",
    });

    const { token } = tokenResponse.body;

    const statementResponse = await request(app)
      .get(`/api/v1/statements/${uuidv4()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(404);
  });

  it("should not be able to get statement of another user", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "pass",
    });

    const { token } = tokenResponse.body;

    const statementResponse = await request(app)
      .get(`/api/v1/statements/${anotherStatementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(404);
  });
});
