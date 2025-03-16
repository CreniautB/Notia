import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { PutObjectRequest, DeleteObjectRequest } from 'aws-sdk/clients/s3';

/**
 * Service pour gérer les opérations sur AWS S3
 *
 * Ce service encapsule toutes les opérations liées à S3 pour le stockage et la récupération des fichiers médias.
 * Pour l'utiliser, vous devez d'abord installer les dépendances nécessaires:
 *
 * ```bash
 * npm install aws-sdk
 * ```
 *
 * Et configurer les variables d'environnement suivantes:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 * - AWS_S3_BUCKET_NAME
 */
@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    // Initialiser le client S3
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });

    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new Error(
        'AWS_S3_BUCKET_NAME is not defined in environment variables',
      );
    }
    this.bucket = bucketName;
  }

  /**
   * Télécharge un fichier vers S3
   * @param file Le fichier à télécharger
   * @param key Le chemin/nom du fichier dans S3 (optionnel, généré automatiquement si non fourni)
   * @returns L'URL du fichier téléchargé
   */
  async uploadFile(file: Express.Multer.File, key?: string): Promise<string> {
    if (!key) {
      // Générer un nom de fichier unique si non fourni
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      key = `media/${uniqueSuffix}.${ext}`;
    }

    const params: PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Rendre le fichier accessible publiquement
    };

    try {
      await this.s3.upload(params).promise();
      return this.getFileUrl(key);
    } catch (error) {
      this.logger.error(
        `Failed to upload file to S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier de S3
   * @param key Le chemin/nom du fichier dans S3
   */
  async deleteFile(key: string): Promise<void> {
    const params: DeleteObjectRequest = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      this.logger.error(
        `Failed to delete file from S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Génère une URL signée pour accéder à un fichier privé
   * @param key Le chemin/nom du fichier dans S3
   * @param expiresIn Durée de validité de l'URL en secondes (par défaut 3600 = 1 heure)
   * @returns L'URL signée
   */
  getSignedUrl(key: string, expiresIn: number = 3600): string {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrl('getObject', params);
  }

  /**
   * Obtient l'URL publique d'un fichier
   * @param key Le chemin/nom du fichier dans S3
   * @returns L'URL publique du fichier
   */
  getFileUrl(key: string): string {
    const region = this.configService.get<string>('AWS_REGION');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Extrait la clé S3 à partir d'une URL S3
   * @param url L'URL S3 complète
   * @returns La clé S3 extraite
   */
  extractKeyFromUrl(url: string): string {
    const region = this.configService.get<string>('AWS_REGION');
    const baseUrl = `https://${this.bucket}.s3.${region}.amazonaws.com/`;

    if (url.startsWith(baseUrl)) {
      return url.substring(baseUrl.length);
    }

    return url; // Si ce n'est pas une URL S3, retourner l'URL telle quelle
  }
}
