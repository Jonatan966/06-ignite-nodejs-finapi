import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create user", async () => {
    const userResponse = await request(app).post("/api/v1/users").send({
      email: "user@email.com",
      password: "pass",
      name: "User",
    });

    expect(userResponse.status).toBe(201);
  });

  it("should not be able to create user with same email", async () => {
    const userResponse = await request(app).post("/api/v1/users").send({
      email: "user@email.com",
      password: "another-pass",
      name: "Another User",
    });

    expect(userResponse.status).toBe(400);
  });
});
