export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  location: string;
  bio: string;
  skills: string[];
  joinedAt: string;
  lastLogin: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
