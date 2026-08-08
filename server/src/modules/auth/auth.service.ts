import { db } from "@/db/client.ts";
import type { User } from "@/db/types.ts";
import { authRepository } from "@/modules/auth/auth.repository.ts";
import type { LoginInput, SignupInput } from "@/modules/auth/auth.schema.ts";
import { hashPassword, verifyPassword } from "@/modules/auth/password.ts";
import { conflict, unauthorized } from "@/shared/errors.ts";
import { slugify } from "@/shared/validation.ts";

export const authService = {
  async signup(input: SignupInput): Promise<User> {
    return db.transaction(async (tx) => {
      const existing = await authRepository.findUserByEmail(input.email, tx);
      if (existing) throw conflict("That email is already registered");

      const org = await authRepository.createOrg(
        tx,
        input.orgName,
        `${slugify(input.orgName)}-${Date.now().toString(36)}`
      );

      const user = await authRepository.createOwner(tx, {
        orgId: org.id,
        displayName: input.displayName,
        email: input.email,
      });

      await authRepository.createPasswordIdentity(tx, {
        userId: user.id,
        email: input.email,
        passwordHash: await hashPassword(input.password),
      });

      return user;
    });
  },

  async login(input: LoginInput): Promise<User> {
    const row = await authRepository.findPasswordIdentity(input.email);

    const valid =
      row?.identity.passwordHash &&
      (await verifyPassword(input.password, row.identity.passwordHash));

    if (!row || !valid) throw unauthorized("Wrong email or password");

    await authRepository.touchIdentity(row.identity.id);

    return row.user;
  },
};
