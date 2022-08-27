import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to deposit", async () => {
    const { body: tokenResponse } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "pass",
      });

    const { token } = tokenResponse;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "The deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able to withdraw", async () => {
    const { body: tokenResponse } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "pass",
      });

    const { token } = tokenResponse;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 75,
        description: "The withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to withdraw if insuficient founds", async () => {
    const { body: tokenResponse } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "pass",
      });

    const { token } = tokenResponse;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "The withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
