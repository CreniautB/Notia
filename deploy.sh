#!/bin/bash

# Script de déploiement pour l'application Notia

echo "Déploiement de l'application Notia..."

# Aller dans le répertoire du projet
cd /home/notia/Notia

# Récupérer les derniers changements
echo "Récupération des derniers changements..."
git pull origin master

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