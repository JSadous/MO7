import { ObjectId } from "mongodb";

/**
 * User Schema Definition
 * This defines the structure and validation for user records in MongoDB
 */
export const UserSchema = {
  _id: {
    type: ObjectId,
    required: true,
    description: "Unique identifier for the user"
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 50,
    trim: true,
    description: "Unique username for the user"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    description: "User's email address"
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    description: "User's hashed password"
  },
  firstName: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
    trim: true,
    description: "User's first name"
  },
  lastName: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
    trim: true,
    description: "User's last name"
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'moderator'],
    default: 'user',
    description: "User's role in the system"
  },
  isActive: {
    type: Boolean,
    default: true,
    description: "Whether the user account is active"
  },
  lastLogin: {
    type: Date,
    description: "Timestamp of user's last login"
  },
  profilePicture: {
    type: String,
    description: "URL to user's profile picture"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: "Timestamp when the user account was created"
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    description: "Timestamp when the user account was last updated"
  }
};

/**
 * Validates user data before database operations
 * @param {Object} userData - The user data to validate
 * @param {Boolean} isUpdate - Whether this is an update operation (password optional)
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateUser = (userData, isUpdate = false) => {
  const errors = [];
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Validate username
  if (!userData.username || typeof userData.username !== 'string') {
    errors.push('Username is required and must be a string');
  } else if (userData.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (userData.username.trim().length > 50) {
    errors.push('Username must be less than 50 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username.trim())) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  // Validate email
  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!emailRegex.test(userData.email.trim())) {
    errors.push('Email must be a valid email address');
  }
  
  // Validate password (only required for creation, not updates)
  if (!isUpdate) {
    if (!userData.password || typeof userData.password !== 'string') {
      errors.push('Password is required and must be a string');
    } else if (userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
  } else if (userData.password && userData.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Validate firstName
  if (!userData.firstName || typeof userData.firstName !== 'string') {
    errors.push('First name is required and must be a string');
  } else if (userData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  } else if (userData.firstName.trim().length > 50) {
    errors.push('First name must be less than 50 characters');
  }
  
  // Validate lastName
  if (!userData.lastName || typeof userData.lastName !== 'string') {
    errors.push('Last name is required and must be a string');
  } else if (userData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  } else if (userData.lastName.trim().length > 50) {
    errors.push('Last name must be less than 50 characters');
  }
  
  // Validate role (if provided)
  if (userData.role && !['admin', 'user', 'moderator'].includes(userData.role)) {
    errors.push('Role must be one of: admin, user, moderator');
  }
  
  // Validate isActive (if provided)
  if (userData.isActive !== undefined && typeof userData.isActive !== 'boolean') {
    errors.push('isActive must be a boolean value');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Sanitizes user data before database operations
 * @param {Object} userData - The user data to sanitize
 * @param {Boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Sanitized user data
 */
export const sanitizeUser = (userData, isUpdate = false) => {
  const sanitized = {
    username: userData.username?.toString().trim().toLowerCase() || '',
    email: userData.email?.toString().trim().toLowerCase() || '',
    firstName: userData.firstName?.toString().trim() || '',
    lastName: userData.lastName?.toString().trim() || '',
    updatedAt: new Date()
  };
  
  // Only include password if it's provided (for updates)
  if (userData.password) {
    sanitized.password = userData.password;
  }
  
  // Include optional fields if provided
  if (userData.role) {
    sanitized.role = userData.role;
  }
  
  if (userData.isActive !== undefined) {
    sanitized.isActive = Boolean(userData.isActive);
  }
  
  if (userData.profilePicture) {
    sanitized.profilePicture = userData.profilePicture.toString().trim();
  }
  
  return sanitized;
};

/**
 * Creates a new user document with default values
 * @param {Object} userData - The user data
 * @returns {Object} - Complete user document
 */
export const createUserDocument = (userData) => {
  const sanitized = sanitizeUser(userData);
  return {
    ...sanitized,
    role: userData.role || 'user',
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a safe user object (without password) for API responses
 * @param {Object} user - The user document from database
 * @returns {Object} - Safe user object without sensitive data
 */
export const createSafeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Validates password strength
 * @param {String} password - The password to validate
 * @returns {Object} - Validation result with strength score and suggestions
 */
export const validatePasswordStrength = (password) => {
  const suggestions = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Include numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else suggestions.push('Include special characters');
  
  const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';
  
  return {
    score,
    strength,
    suggestions,
    isStrong: score >= 4
  };
};

export default UserSchema;
