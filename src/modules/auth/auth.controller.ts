import type { Request, Response } from "express";
import { registerUser } from "./auth.service.js";
import type { RegisterBody } from "./auth.types.js";
import {
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  parseDateOnly,
} from "./auth.utils.js";

export const register = async (req: Request, res: Response) => {
  const body = req.body as RegisterBody;
  const email = body.email?.trim().toLowerCase();
  const username = body.username?.trim();
  const password = body.password ?? "";
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const dateOfBirth = body.dateOfBirth;
  const showBirthYear = body.showBirthYear ?? true;

  if (
    !email ||
    !username ||
    !password ||
    !firstName ||
    !lastName ||
    !dateOfBirth
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "Invalid username." });
  }

  if (!isStrongPassword(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }

  const parsedDob = parseDateOnly(dateOfBirth);
  if (!parsedDob) {
    return res.status(400).json({ error: "Invalid dateOfBirth." });
  }

  if (parsedDob > new Date()) {
    return res.status(400).json({ error: "dateOfBirth must be in the past." });
  }

  try {
    const user = await registerUser({
      email,
      username,
      password,
      firstName,
      lastName,
      dateOfBirth: parsedDob,
      showBirthYear,
    });

    return res.status(201).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_TAKEN") {
        return res.status(409).json({ error: "Email already in use." });
      }
      if (error.message === "USERNAME_TAKEN") {
        return res.status(409).json({ error: "Username already in use." });
      }
    }
    return res.status(500).json({ error: "Unable to register user." });
  }
};
