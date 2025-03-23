#!/bin/bash

# Script de déploiement pour l'application Notia

echo "Déploiement de l'application Notia..."

# Aller dans le répertoire du projet
cd /home/notia/Notia

echo "=== Pulling latest changes ==="
# Sauvegarder les changements locaux important (sauf package-lock.json)
git stash save --keep-index "Sauvegarde automatique avant déploiement"

# Forcer la récupération des derniers changements en écrasant les modifications locales
git fetch --all
git reset --hard origin/master
git clean -f -d
echo "Changements distants forcés et appliqués"

# Installer les dépendances
echo "Installation des dépendances..."
npm install

# Construire l'application
echo "Construction de l'application..."
npm run build:all

# Redémarrer les services
echo "Redémarrage des services..."
pm2 restart notia-frontend notia-backend
pm2 save

echo "Déploiement terminé !" 