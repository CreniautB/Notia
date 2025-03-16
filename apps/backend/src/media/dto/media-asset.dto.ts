import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import {
  MediaAssetType,
  MediaAssetCategory,
} from '../schemas/media-asset.schema';

export class CreateMediaAssetDto {
  @ApiProperty({
    description: 'Nom de la ressource média',
    example: 'Drapeau de la France',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'URL de la ressource média',
    example: 'https://example.com/images/france-flag.png',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Type de ressource média',
    enum: MediaAssetType,
    example: MediaAssetType.IMAGE,
  })
  @IsEnum(MediaAssetType)
  @IsNotEmpty()
  type: MediaAssetType;

  @ApiProperty({
    description: 'Catégorie de la ressource média',
    enum: MediaAssetCategory,
    example: MediaAssetCategory.FLAG,
  })
  @IsEnum(MediaAssetCategory)
  @IsNotEmpty()
  category: MediaAssetCategory;

  @ApiPropertyOptional({
    description: 'Description de la ressource média',
    example: 'Drapeau tricolore de la République française',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tags associés à la ressource média',
    example: ['france', 'drapeau', 'europe'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: "Largeur de l'image en pixels",
    example: 1200,
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: "Hauteur de l'image en pixels",
    example: 800,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Durée du média en secondes (pour audio/vidéo)',
    example: 120,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Taille du fichier en octets',
    example: 1024000,
  })
  @IsNumber()
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({
    description: 'Indique si la ressource est publique',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: "Identifiant de l'utilisateur qui a créé la ressource",
    example: 'user123',
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateMediaAssetDto extends PartialType(CreateMediaAssetDto) {}

export class MediaAssetResponseDto extends CreateMediaAssetDto {
  @ApiProperty({
    description: 'Identifiant unique de la ressource média',
    example: '60d21b4667d0d8992e610c86',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de fois où cette ressource a été utilisée',
    example: 5,
  })
  usageCount: number;

  @ApiProperty({
    description: 'Date de création de la ressource',
    example: '2023-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour de la ressource',
    example: '2023-01-02T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class MediaAssetQueryDto {
  @ApiPropertyOptional({
    description: 'Type de ressource média à filtrer',
    enum: MediaAssetType,
  })
  @IsEnum(MediaAssetType)
  @IsOptional()
  type?: MediaAssetType;

  @ApiPropertyOptional({
    description: 'Catégorie de ressource média à filtrer',
    enum: MediaAssetCategory,
  })
  @IsEnum(MediaAssetCategory)
  @IsOptional()
  category?: MediaAssetCategory;

  @ApiPropertyOptional({
    description: 'Terme de recherche (nom, description, tags)',
    example: 'france',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtre pour les ressources publiques uniquement',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
