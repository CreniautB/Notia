import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import {
  CreateMediaAssetDto,
  UpdateMediaAssetDto,
  MediaAssetResponseDto,
  MediaAssetQueryDto,
} from './dto/media-asset.dto';
import {
  MediaAssetType,
  MediaAssetCategory,
} from './schemas/media-asset.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration pour le stockage local des fichiers
 *
 * NOTE: Pour une application en production, il est recommandé d'utiliser AWS S3 ou un service similaire
 * au lieu du stockage local. Pour implémenter S3:
 *
 * 1. Installer le SDK AWS: npm install aws-sdk
 * 2. Configurer les informations d'identification AWS
 * 3. Remplacer le stockage local par un middleware qui télécharge vers S3
 *
 * Exemple d'implémentation avec S3:
 * ```
 * import * as AWS from 'aws-sdk';
 * import * as multerS3 from 'multer-s3';
 *
 * const s3 = new AWS.S3({
 *   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 *   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 *   region: process.env.AWS_REGION
 * });
 *
 * const storage = multerS3({
 *   s3: s3,
 *   bucket: process.env.AWS_S3_BUCKET_NAME,
 *   acl: 'public-read',
 *   key: (req, file, cb) => {
 *     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
 *     const ext = extname(file.originalname);
 *     cb(null, `media/${uniqueSuffix}${ext}`);
 *   }
 * });
 * ```
 *
 * Ensuite, l'URL du fichier serait construite à partir du bucket S3:
 * `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/media/${filename}`
 */
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME du fichier
  if (
    file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp3|mp4|mpeg|quicktime)$/)
  ) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Format de fichier non supporté'), false);
  }
};

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle ressource média' })
  @ApiResponse({
    status: 201,
    description: 'La ressource média a été créée avec succès',
    type: MediaAssetResponseDto,
  })
  create(@Body() createMediaAssetDto: CreateMediaAssetDto) {
    return this.mediaService.create(createMediaAssetDto);
  }

  @Post('upload')
  @ApiOperation({
    summary: 'Télécharger un fichier média et créer une ressource',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
        category: {
          type: 'string',
          enum: Object.values(MediaAssetCategory),
        },
        description: {
          type: 'string',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        isPublic: {
          type: 'boolean',
        },
        createdBy: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Le fichier a été téléchargé et la ressource média créée avec succès',
    type: MediaAssetResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException("Aucun fichier n'a été téléchargé");
    }

    // Déterminer le type de média en fonction du MIME type
    let type: MediaAssetType;
    if (file.mimetype.startsWith('image/')) {
      type = MediaAssetType.IMAGE;
    } else if (file.mimetype.startsWith('audio/')) {
      type = MediaAssetType.AUDIO;
    } else if (file.mimetype.startsWith('video/')) {
      type = MediaAssetType.VIDEO;
    } else {
      throw new BadRequestException('Type de fichier non supporté');
    }

    // Créer l'URL du fichier
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    // Préparer les données pour la création de la ressource média
    const createMediaAssetDto: CreateMediaAssetDto = {
      name: body.name || file.originalname,
      url: fileUrl,
      type,
      category: body.category || MediaAssetCategory.OTHER,
      description: body.description,
      tags: body.tags ? JSON.parse(body.tags) : [],
      size: file.size,
      isPublic: body.isPublic === 'true',
      createdBy: body.createdBy,
    };

    // Ajouter des métadonnées spécifiques au type de fichier
    if (type === MediaAssetType.IMAGE) {
      // Pour les images, on pourrait ajouter la largeur et la hauteur
      // Cela nécessiterait une bibliothèque comme sharp pour extraire ces informations
    } else if (type === MediaAssetType.AUDIO || type === MediaAssetType.VIDEO) {
      // Pour les fichiers audio/vidéo, on pourrait ajouter la durée
      // Cela nécessiterait une bibliothèque comme ffprobe pour extraire ces informations
    }

    // Créer la ressource média dans la base de données
    return this.mediaService.create(createMediaAssetDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Récupérer toutes les ressources médias avec pagination et filtres',
  })
  @ApiQuery({ name: 'type', required: false, enum: MediaAssetType })
  @ApiQuery({ name: 'category', required: false, enum: MediaAssetCategory })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Liste des ressources médias',
    type: [MediaAssetResponseDto],
  })
  findAll(@Query() query: MediaAssetQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Récupérer les ressources médias par catégorie' })
  @ApiParam({ name: 'category', enum: MediaAssetCategory })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Liste des ressources médias par catégorie',
    type: [MediaAssetResponseDto],
  })
  findByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: number,
  ) {
    return this.mediaService.findByCategory(category, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des ressources médias par terme' })
  @ApiQuery({ name: 'term', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Résultats de la recherche',
    type: [MediaAssetResponseDto],
  })
  search(@Query('term') term: string, @Query('limit') limit?: number) {
    return this.mediaService.search(term, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une ressource média par ID' })
  @ApiParam({ name: 'id', description: 'ID de la ressource média' })
  @ApiResponse({
    status: 200,
    description: 'La ressource média a été trouvée',
    type: MediaAssetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "La ressource média n'a pas été trouvée",
  })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une ressource média' })
  @ApiParam({ name: 'id', description: 'ID de la ressource média' })
  @ApiResponse({
    status: 200,
    description: 'La ressource média a été mise à jour avec succès',
    type: MediaAssetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "La ressource média n'a pas été trouvée",
  })
  update(
    @Param('id') id: string,
    @Body() updateMediaAssetDto: UpdateMediaAssetDto,
  ) {
    return this.mediaService.update(id, updateMediaAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une ressource média' })
  @ApiParam({ name: 'id', description: 'ID de la ressource média' })
  @ApiResponse({
    status: 204,
    description: 'La ressource média a été supprimée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: "La ressource média n'a pas été trouvée",
  })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  @Patch(':id/increment-usage')
  @ApiOperation({
    summary: "Incrémenter le compteur d'utilisation d'une ressource média",
  })
  @ApiParam({ name: 'id', description: 'ID de la ressource média' })
  @ApiResponse({
    status: 200,
    description: "Le compteur d'utilisation a été incrémenté avec succès",
    type: MediaAssetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "La ressource média n'a pas été trouvée",
  })
  incrementUsageCount(@Param('id') id: string) {
    return this.mediaService.incrementUsageCount(id);
  }
}
