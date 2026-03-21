// Password validation matching your backend rules
export const validatePassword = (password: string): string | null => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!passwordRegex.test(password)) {
    return 'Password must include uppercase, lowercase, number, and special character';
  }
  return null;
};

// Email validation for students
export const validateStudentEmail = (email: string): string | null => {
  const emailRegex = /^[0-9]{9}@gordoncollege\.edu\.ph$/;
  
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) {
    return 'Must use Gordon College email (e.g., 123456789@gordoncollege.edu.ph)';
  }
  return null;
};

// Generic email validation for other roles
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

// Name validation
export const validateName = (name: string, field: string): string | null => {
  if (!name || name.trim().length === 0) return `${field} is required`;
  if (name.trim().length < 2) return `${field} must be at least 2 characters`;
  return null;
};
