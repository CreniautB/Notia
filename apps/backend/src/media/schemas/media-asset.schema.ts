import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MediaAssetDocument = MediaAsset & Document;

export enum MediaAssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum MediaAssetCategory {
  FLAG = 'flag',
  LANDMARK = 'landmark',
  PERSON = 'person',
  ANIMAL = 'animal',
  NATURE = 'nature',
  SCIENCE = 'science',
  HISTORY = 'history',
  ART = 'art',
  SPORT = 'sport',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class MediaAsset {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, enum: Object.values(MediaAssetType) })
  type: MediaAssetType;

  @Prop({ required: true, enum: Object.values(MediaAssetCategory) })
  category: MediaAssetCategory;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  duration?: number; // Pour les fichiers audio/vidéo

  @Prop()
  size?: number; // Taille en octets

  @Prop({ default: false })
  isPublic: boolean;

  @Prop()
  createdBy?: string;

  @Prop({ type: Number, default: 0 })
  usageCount: number; // Nombre de fois où cette ressource a été utilisée
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

// Ajouter des index pour améliorer les performances des requêtes
MediaAssetSchema.index({ name: 'text', description: 'text', tags: 'text' });
MediaAssetSchema.index({ category: 1 });
MediaAssetSchema.index({ type: 1 });
MediaAssetSchema.index({ isPublic: 1 });
