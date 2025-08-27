
import mongoose, { Schema, models, model, Document, Model } from 'mongoose';

// --- User Schema ---
const UserSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  expertise: { type: String, required: true },
  currentWorkload: { type: Number, default: 0 },
  phone: String,
  dob: String,
}, { _id: false });

// --- Team Schema ---
const TeamMemberSchema = new Schema({
  user: { type: String, ref: 'User' },
  role: { type: String, enum: ['leader', 'member'], required: true },
}, { _id: false });

const TeamSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  members: [TeamMemberSchema],
}, { _id: false });

// --- Task Schema ---
const TaskSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in-progress', 'done', 'backlog'], required: true },
  assignee: { type: String, ref: 'User', default: null },
  team: { type: String, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
  startDate: Date,
  dueDate: Date,
  tags: [String],
}, { _id: false });


// To prevent model overwrite errors in Next.js hot-reloading environments
export const User = (models.User || model('User', UserSchema)) as Model<Document & import('@/types').User>;
export const Team = (models.Team || model('Team', TeamSchema)) as Model<Document & import('@/types').Team>;
export const Task = (models.Task || model('Task', TaskSchema)) as Model<Document & import('@/types').Task>;
