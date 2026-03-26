export interface User {
  id: string;
  email: string;
}

export interface AuthToken {
  user: User;
  token: string;
  expiresAt: number;
}

// Simple hash function for demo purposes
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Generate a simple token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Register a new user
export function registerUser(email: string, password: string): AuthToken {
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  
  if (users[email]) {
    throw new Error('User already exists');
  }
  
  if (!email || !password) {
    throw new Error('Email and password required');
  }

  const userId = Math.random().toString(36).substring(7);
  const hashedPassword = simpleHash(password);

  users[email] = {
    id: userId,
    password: hashedPassword,
  };

  localStorage.setItem('users', JSON.stringify(users));

  const token = generateToken();
  const authToken: AuthToken = {
    user: { id: userId, email },
    token,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  localStorage.setItem(`auth_${email}`, JSON.stringify(authToken));
  localStorage.setItem('currentUser', email);

  return authToken;
}

// Login user
export function loginUser(email: string, password: string): AuthToken {
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = simpleHash(password);
  if (user.password !== hashedPassword) {
    throw new Error('Invalid password');
  }

  const token = generateToken();
  const authToken: AuthToken = {
    user: { id: user.id, email },
    token,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(`auth_${email}`, JSON.stringify(authToken));
  localStorage.setItem('currentUser', email);

  return authToken;
}

// Logout user
export function logoutUser(): void {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    localStorage.removeItem(`auth_${currentUser}`);
    localStorage.removeItem('currentUser');
  }
}

// Get current user
export function getCurrentUser(): User | null {
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return null;

    const authData = localStorage.getItem(`auth_${currentUser}`);
    if (!authData) return null;

    const authToken: AuthToken = JSON.parse(authData);
    
    // Check if token is expired
    if (authToken.expiresAt < Date.now()) {
      logoutUser();
      return null;
    }

    return authToken.user;
  } catch {
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
