import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "../ShowUserProfileError";
import { ShowUserProfileUseCase } from "../ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "profile-user@email.com",
      name: "User",
      password: await hash("the-pass", 8),
    });

    const profile = await showUserProfileUseCase.execute(String(user.id));

    expect(profile).toHaveProperty("id", user.id);
    expect(profile.id).toBeTruthy();
  });

  it("should not be able to show user profile if user not found", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("inexistent-id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
