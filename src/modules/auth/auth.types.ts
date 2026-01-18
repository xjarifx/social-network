export type RegisterBody = {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  showBirthYear?: boolean;
};

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  showBirthYear: boolean;
};

export type PublicUser = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  dateOfBirth: Date;
  showBirthYear: boolean;
  status: string;
  privacySetting: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};
