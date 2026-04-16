// src/models/Cloth.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICloth extends Document {
  suggestions: {
    item?: string;
    reason?: string;
    suggestedStyle?: string;
  }[];
  s3Key: string;
  category: string;
  subCategory: string;
  color: string;
  material: string;
  style: string;
  description: string;
  createdAt: Date;
}

const ClothSchema: Schema = new Schema({
  s3Key: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  color: { type: String, required: true },
  material: { type: String },
  style: { type: String },
  description: { type: String },
  suggestions: [
    {
      item: String,
      reason: String,
      suggestedStyle: String
    }
  ],
    createdAt: { type: Date, default: Date.now },

});

export default mongoose.model<ICloth>('Cloth', ClothSchema);
