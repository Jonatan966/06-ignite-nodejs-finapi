import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate user", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "pass",
    });

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body).toHaveProperty("token");
    expect(tokenResponse.body).toHaveProperty("user");
  });

  it("should not be able to authenticate user with incorrect email", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "incorrect@email.com",
      password: "pass",
    });

    expect(tokenResponse.status).toBe(401);
  });

  it("should not be able to authenticate user with incorrect password", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "incorrect-pass",
    });

    expect(tokenResponse.status).toBe(401);
  });
});
