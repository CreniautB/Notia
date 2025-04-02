import { Injectable } from '@nestjs/common';
import * as natural from 'natural';
import { NlpManager } from 'node-nlp';

@Injectable()
export class NlpService {
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof natural.PorterStemmer;
  private nlpManager: NlpManager;

  constructor() {
    // Initialiser les outils NLP
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;

    // Initialiser le gestionnaire NLP avec le français comme langue
    this.nlpManager = new NlpManager({ languages: ['fr'] });
  }

  /**
   * Prétraite le texte d'une question pour l'analyse
   * - Convertit en minuscules
   * - Supprime la ponctuation
   * - Tokenize le texte
   * - Applique le stemming (réduction des mots à leur racine)
   */
  preprocessText(text: string): string[] {
    // Convertir en minuscules
    const lowercaseText = text.toLowerCase();

    // Supprimer la ponctuation et les caractères spéciaux
    const cleanText = lowercaseText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

    // Tokenizer le texte
    const tokens = this.tokenizer.tokenize(cleanText);

    // Appliquer le stemming
    const stems = tokens ? tokens.map((token) => this.stemmer.stem(token)) : [];

    return stems;
  }

  /**
   * Extrait les entités nommées d'une question
   * Par exemple, "Quelle est la capitale de la France ?" -> ["capitale", "France"]
   */
  async extractEntities(text: string): Promise<string[]> {
    // Analyser le texte avec le NLP Manager
    const result = await this.nlpManager.process('fr', text);

    // Extraire les entités reconnues
    const entities = result.entities.map((entity) => entity.option);

    // Si aucune entité n'est reconnue, extraire les noms propres et mots clés
    if (entities.length === 0) {
      const tokens = this.tokenizer.tokenize(text);

      // Filtrer les mots importants (plus de 3 lettres, pas des mots vides)
      const stopWords = [
        'est',
        'qui',
        'que',
        'quoi',
        'quel',
        'quelle',
        'quels',
        'quelles',
        'comment',
        'pourquoi',
        'quand',
        'où',
        'les',
        'des',
        'une',
        'pour',
        'dans',
        'avec',
        'sur',
        'par',
        'la',
        'le',
        'du',
        'de',
        'un',
        'une',
        'et',
        'ou',
      ];

      // Extraire les mots clés (mots importants qui ne sont pas des mots vides)
      const keywords = tokens ? tokens.filter(
        (token) => token.length > 3 && !stopWords.includes(token.toLowerCase()),
      ) : [];

      // Pour les questions de type "capitale de X", essayer d'extraire le nom du pays
      if (text.toLowerCase().includes('capitale')) {
        // Rechercher des motifs comme "de la France", "de l'Italie", "du Japon"
        const countryMatches = text.match(
          /(?:de la|de l'|du|des|de) ([A-Z][a-zÀ-ÿ-]+)/g,
        );
        if (countryMatches && countryMatches.length > 0) {
          // Extraire le nom du pays de chaque correspondance
          const countries = countryMatches.map((match) => {
            // Enlever le "de la", "de l'", "du", "des" ou "de" du début
            return match.replace(/^(?:de la|de l'|du|des|de) /, '');
          });

          // Ajouter les pays aux mots clés
          keywords.push(...countries);
        }
      }

      return keywords;
    }

    return entities;
  }

  /**
   * Calcule la similarité entre deux questions
   * Retourne un score entre 0 (aucune similarité) et 1 (identique)
   */
  calculateSimilarity(question1: string, question2: string): number {
    // Prétraiter les deux questions
    const tokens1 = this.preprocessText(question1);
    const tokens2 = this.preprocessText(question2);

    // Utiliser la similarité de Jaccard (intersection / union)
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    // Calculer l'intersection
    const intersection = new Set([...set1].filter((x) => set2.has(x)));

    // Calculer l'union
    const union = new Set([...set1, ...set2]);

    // Calculer la similarité de Jaccard
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Détermine si deux questions sont potentiellement des doublons
   * basé sur leur similarité et les entités qu'elles contiennent
   */
  async arePotentialDuplicates(
    question1: string,
    question2: string,
  ): Promise<boolean> {
    // Calculer la similarité textuelle
    const similarityScore = this.calculateSimilarity(question1, question2);

    console.log('Comparaison de questions:', {
      question1,
      question2,
      similarityScore,
    });

    // Approche simplifiée et générique pour la détection des doublons

    // 1. Vérifier si les questions contiennent des qualificatifs différents
    // Par exemple "après X", "avant X", "sauf X", etc.
    const qualifierPattern =
      /(après|avant|sauf|excepté|hormis|sans compter|à l'exception de) (la |le |l'|les |du |de la |des |de l')?([a-zÀ-ÿ\s-]+)/i;
    const qualifierMatch1 = question1.match(qualifierPattern);
    const qualifierMatch2 = question2.match(qualifierPattern);

    // Si une question a un qualificatif et l'autre non, ce ne sont pas des doublons
    if (
      (qualifierMatch1 && !qualifierMatch2) ||
      (!qualifierMatch1 && qualifierMatch2)
    ) {
      console.log("Une question contient un qualificatif et l'autre non");
      return false;
    }

    // Si les deux questions ont des qualificatifs différents, ce ne sont pas des doublons
    if (
      qualifierMatch1 &&
      qualifierMatch2 &&
      (qualifierMatch1[1] !== qualifierMatch2[1] ||
        qualifierMatch1[3].trim().toLowerCase() !==
          qualifierMatch2[3].trim().toLowerCase())
    ) {
      console.log('Les questions contiennent des qualificatifs différents');
      return false;
    }

    // 2. Extraire les entités pour une comparaison plus précise
    const entities1 = await this.extractEntities(question1);
    const entities2 = await this.extractEntities(question2);

    // Calculer les entités uniques à chaque question
    const uniqueEntities1 = entities1.filter((e) => !entities2.includes(e));
    const uniqueEntities2 = entities2.filter((e) => !entities1.includes(e));

    console.log('Entités uniques:', {
      uniqueEntities1,
      uniqueEntities2,
    });

    // 3. Vérifier les catégories générales des questions
    // Définir des catégories générales pour différents domaines
    const categories = [
      {
        name: 'géographie',
        pattern:
          /(pays|continent|ville|capitale|lac|océan|mer|fleuve|rivière|montagne|sommet|île|désert|région|territoire)/i,
      },
      {
        name: 'histoire',
        pattern:
          /(guerre|bataille|révolution|empire|royaume|roi|reine|empereur|président|traité|événement|date|siècle|époque|période|ancien|historique)/i,
      },
      {
        name: 'science',
        pattern:
          /(élément|chimique|physique|biologie|espèce|animal|plante|cellule|atome|molécule|planète|étoile|galaxie|univers|théorie|loi|scientifique)/i,
      },
      {
        name: 'culture',
        pattern:
          /(art|musique|film|livre|auteur|écrivain|peintre|artiste|acteur|réalisateur|œuvre|tableau|roman|poème|chanson|album|groupe|musicien)/i,
      },
      {
        name: 'sport',
        pattern:
          /(sport|équipe|joueur|match|tournoi|championnat|coupe|olympique|record|médaille|compétition|athlète|football|tennis|basket|rugby)/i,
      },
    ];

    // Déterminer les catégories de chaque question
    const categoriesQ1 = categories
      .filter((cat) => cat.pattern.test(question1))
      .map((cat) => cat.name);
    const categoriesQ2 = categories
      .filter((cat) => cat.pattern.test(question2))
      .map((cat) => cat.name);

    console.log('Catégories détectées:', {
      categoriesQ1,
      categoriesQ2,
    });

    // Si les questions appartiennent à des catégories différentes et n'ont aucune catégorie en commun
    if (
      categoriesQ1.length > 0 &&
      categoriesQ2.length > 0 &&
      !categoriesQ1.some((cat) => categoriesQ2.includes(cat))
    ) {
      console.log('Questions de catégories différentes');
      return false;
    }

    // 4. Décision finale basée sur la similarité et les entités

    // Si la similarité est très élevée (> 0.7), considérer comme doublon potentiel
    if (similarityScore > 0.7) {
      // Mais si chaque question a au moins une entité unique significative, ce ne sont pas des doublons
      if (uniqueEntities1.length >= 1 && uniqueEntities2.length >= 1) {
        console.log(
          'Malgré une forte similarité, les questions ont des entités uniques significatives',
        );
        return false;
      }

      console.log('Similarité très élevée (> 0.7), considéré comme doublon');
      return true;
    }

    // Si la similarité est moyenne (0.5-0.7), vérifier les entités communes
    if (similarityScore > 0.5) {
      // Calculer les entités communes
      const commonEntities = entities1.filter((e) => entities2.includes(e));

      // Si les questions partagent au moins 2 entités importantes et ont peu d'entités uniques,
      // considérer comme doublon
      if (
        commonEntities.length >= 2 &&
        uniqueEntities1.length <= 1 &&
        uniqueEntities2.length <= 1
      ) {
        console.log(
          'Similarité moyenne avec plusieurs entités communes, considéré comme doublon',
        );
        return true;
      }
    }

    // Par défaut, ne pas considérer comme doublon
    return false;
  }

  /**
   * Extrait le sujet d'une question de type superlatif
   * Par exemple, "Quel est le plus grand lac du monde ?" -> "lac"
   */
  private extractSuperlativeSubject(question: string): string | null {
    // Normaliser la question
    const normalizedQuestion = question.toLowerCase();

    // Différents patterns pour extraire le sujet
    const patterns = [
      /quel est le plus (grand|haut|long|petit|profond|large|élevé|important|populaire|peuplé|vaste|chaud|froid) (.*?) (du monde|de la terre|de l'univers|existant|connu)/i,
      /quel est le plus (grand|haut|long|petit|profond|large|élevé|important|populaire|peuplé|vaste|chaud|froid) (.*?)( \?|$)/i,
    ];

    for (const pattern of patterns) {
      const match = normalizedQuestion.match(pattern);
      if (match && match[2]) {
        // Nettoyer et retourner le sujet
        return match[2]
          .trim()
          .replace(/^(le |la |les |l'|du |de la |des |de l')/, '');
      }
    }

    return null;
  }
}
