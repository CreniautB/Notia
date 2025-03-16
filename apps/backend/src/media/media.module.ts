import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaAsset, MediaAssetSchema } from './schemas/media-asset.schema';

/**
 * Module de gestion des médias
 *
 * NOTE: Pour une application en production avec AWS S3:
 *
 * 1. Le ServeStaticModule ne serait plus nécessaire car les fichiers seraient servis directement depuis S3
 * 2. Il faudrait ajouter un service S3 pour gérer les opérations sur les fichiers
 *
 * Exemple de configuration:
 * ```typescript
 * import { S3Service } from './s3.service';
 *
 * @Module({
 *   imports: [
 *     MongooseModule.forFeature([
 *       { name: MediaAsset.name, schema: MediaAssetSchema },
 *     ]),
 *     // Pas besoin de ServeStaticModule avec S3
 *   ],
 *   controllers: [MediaController],
 *   providers: [MediaService, S3Service],
 *   exports: [MediaService, S3Service],
 * })
 * export class MediaModule {}
 * ```
 *
 * Vous devriez également créer un service S3 qui encapsule toutes les opérations S3:
 * - uploadFile
 * - deleteFile
 * - getSignedUrl (pour générer des URLs temporaires si nécessaire)
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaAsset.name, schema: MediaAssetSchema },
    ]),
    // Servir les fichiers statiques du dossier uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
