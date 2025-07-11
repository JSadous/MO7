import { ObjectId } from "mongodb";

/**
 * Agent Schema Definition
 * This defines the structure and validation for agent records in MongoDB
 */
export const AgentSchema = {
  _id: {
    type: ObjectId,
    required: true,
    description: "Unique identifier for the agent"
  },
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
    trim: true,
    description: "Full name of the agent"
  },
  region: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
    trim: true,
    description: "Geographic region where the agent operates"
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: "Agent rating from 1 to 5"
  },
  fee: {
    type: Number,
    required: true,
    min: 0,
    description: "Agent fee amount in dollars"
  },
  sales: {
    type: Number,
    required: true,
    min: 0,
    description: "Number of sales completed by the agent"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: "Timestamp when the agent record was created"
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    description: "Timestamp when the agent record was last updated"
  }
};

/**
 * Validates agent data before database operations
 * @param {Object} agentData - The agent data to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateAgent = (agentData) => {
  const errors = [];
  
  // Validate name
  if (!agentData.name || typeof agentData.name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (agentData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (agentData.name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  // Validate region
  if (!agentData.region || typeof agentData.region !== 'string') {
    errors.push('Region is required and must be a string');
  } else if (agentData.region.trim().length < 2) {
    errors.push('Region must be at least 2 characters long');
  } else if (agentData.region.trim().length > 50) {
    errors.push('Region must be less than 50 characters');
  }
  
  // Validate rating
  const rating = Number(agentData.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }
  
  // Validate fee
  const fee = Number(agentData.fee);
  if (isNaN(fee) || fee < 0) {
    errors.push('Fee must be a positive number');
  }
  
  // Validate sales
  const sales = Number(agentData.sales);
  if (isNaN(sales) || sales < 0) {
    errors.push('Sales must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Sanitizes agent data before database operations
 * @param {Object} agentData - The agent data to sanitize
 * @returns {Object} - Sanitized agent data
 */
export const sanitizeAgent = (agentData) => {
  return {
    name: agentData.name?.toString().trim() || '',
    region: agentData.region?.toString().trim() || '',
    rating: Number(agentData.rating) || 0,
    fee: Number(agentData.fee) || 0,
    sales: Number(agentData.sales) || 0,
    updatedAt: new Date()
  };
};

/**
 * Creates a new agent document with default values
 * @param {Object} agentData - The agent data
 * @returns {Object} - Complete agent document
 */
export const createAgentDocument = (agentData) => {
  const sanitized = sanitizeAgent(agentData);
  return {
    ...sanitized,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export default AgentSchema;
