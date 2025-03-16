# Module de gestion des médias

Ce module permet de gérer les ressources médias (images, audio, vidéo) pour l'application Notia.

## Stockage local vs. Stockage cloud (AWS S3)

### Configuration actuelle : Stockage local

Actuellement, l'application utilise un stockage local pour les fichiers médias :

- Les fichiers sont stockés dans le dossier `./uploads` du serveur
- Le module `ServeStaticModule` de NestJS est utilisé pour servir ces fichiers
- Les métadonnées des fichiers sont stockées dans MongoDB

Cette approche est simple et fonctionne bien pour le développement, mais présente plusieurs limitations pour un environnement de production :

- Pas d'évolutivité automatique
- Pas de redondance géographique
- Risque de perte de données si le serveur tombe en panne
- Problèmes de performance pour servir de nombreux fichiers

### Recommandation pour la production : AWS S3

Pour une application en production, nous recommandons d'utiliser AWS S3 (Simple Storage Service) :

#### Avantages de S3

- **Évolutivité illimitée** : S3 peut gérer des pétaoctets de données
- **Haute disponibilité** : 99,99% de disponibilité
- **Durabilité** : 99,999999999% (11 neuf) de durabilité
- **Performance** : Distribution via CloudFront CDN
- **Sécurité** : Chiffrement, contrôle d'accès, etc.
- **Coût optimisé** : Vous ne payez que pour ce que vous utilisez

## Migration vers AWS S3

### 1. Installation des dépendances

```bash
npm install aws-sdk multer-s3
```

### 2. Configuration des variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
AWS_REGION=votre_region
AWS_S3_BUCKET_NAME=votre_bucket
```

### 3. Utilisation du service S3

Nous avons préparé un service S3 (`s3.service.ts`) qui encapsule toutes les opérations nécessaires :

- `uploadFile` : Télécharge un fichier vers S3
- `deleteFile` : Supprime un fichier de S3
- `getSignedUrl` : Génère une URL signée pour accéder à un fichier privé
- `getFileUrl` : Obtient l'URL publique d'un fichier

### 4. Modification du contrôleur média

Dans `media.controller.ts`, remplacez le stockage local par S3 :

```typescript
// Remplacer le stockage local
const storage = multerS3({
  s3: s3Service.getS3Client(),
  bucket: s3Service.getBucketName(),
  acl: 'public-read',
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `media/${uniqueSuffix}${ext}`);
  },
});
```

### 5. Modification du module média

Dans `media.module.ts`, supprimez le `ServeStaticModule` et ajoutez le service S3 :

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaAsset.name, schema: MediaAssetSchema },
    ]),
    // ServeStaticModule n'est plus nécessaire
  ],
  controllers: [MediaController],
  providers: [MediaService, S3Service],
  exports: [MediaService, S3Service],
})
export class MediaModule {}
```

## Bonnes pratiques pour la gestion des médias

1. **Utiliser des hachages pour les noms de fichiers** : Générez des noms uniques pour éviter les collisions
2. **Limiter les types de fichiers acceptés** : Filtrez les types MIME pour n'accepter que les formats souhaités
3. **Limiter la taille des fichiers** : Définissez une taille maximale pour éviter les abus
4. **Implémenter un nettoyage périodique** : Supprimez les fichiers orphelins qui ne sont plus référencés
5. **Utiliser des URL signées pour les fichiers privés** : Limitez l'accès aux fichiers sensibles
6. **Mettre en place un CDN** : Utilisez CloudFront pour améliorer les performances

## Migration des fichiers existants

Si vous avez déjà des fichiers stockés localement, vous pouvez les migrer vers S3 avec un script :

```typescript
import { S3Service } from './s3.service';
import * as fs from 'fs';
import * as path from 'path';

async function migrateFilesToS3(s3Service: S3Service) {
  const uploadDir = './uploads';
  const files = fs.readdirSync(uploadDir);

  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    const s3Key = `media/${file}`;
    await s3Service.uploadFile(
      {
        buffer: fileBuffer,
        originalname: file,
        mimetype: getMimeType(file),
      } as Express.Multer.File,
      s3Key,
    );

    console.log(`Migrated ${file} to S3`);
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  // Map extensions to MIME types
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    // Add more as needed
  };

  return mimeTypes[ext] || 'application/octet-stream';
}
```
