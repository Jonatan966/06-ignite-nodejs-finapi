import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../../app";
import authConfig from "../../../../../config/auth";

let connection: Connection;

describe("Show User Profile Controller", () => {
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

  it("should be able to show user profile", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "pass",
    });

    const { token, user } = tokenResponse.body;

    const profileResponse = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body).toHaveProperty("id", user.id);
  });

  it("should not be able to show profile of a inexistent user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const simulatedToken = sign({}, secret, {
      subject: uuidv4(),
      expiresIn,
    });

    const profileResponse = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${simulatedToken}`,
      });

    expect(profileResponse.status).toBe(404);
  });
});
