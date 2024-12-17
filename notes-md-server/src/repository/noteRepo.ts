import { MODELS } from "@/constants/models";
import { Note } from '@/entity/note';
import mongoose, { Model, Schema } from "mongoose";

type NoteModel = Model<Note>;

const NoteSchema = new Schema<Note, NoteModel>({
  id: { type: String, required: true, index: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const NoteRepo = mongoose.model(MODELS.NOTE, NoteSchema);
