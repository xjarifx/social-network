export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_\.]{3,30}$/.test(username);
};

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const parseDateOnly = (value: string): Date | null => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};
