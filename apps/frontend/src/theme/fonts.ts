import { Rampart_One, Roboto, Mogra } from 'next/font/google';

// Police pour les titres principaux (ancienne version)
// export const rampartOne = Rampart_One({
//   weight: '400', // La police Rampart One n'a généralement qu'un seul poids
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-rampart-one',
// });

// Nouvelle police pour les titres
export const mogra = Mogra({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mogra',
});

// Pour maintenir la compatibilité avec les composants existants
export const rampartOne = mogra;

// Police principale pour le contenu
export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// Vous pouvez ajouter plus de polices ici selon vos besoins
// export const anotherFont = AnotherFont({...})

// Configuration des familles de polices pour Material UI
export const fontConfig = {
  titleFontFamily: `${mogra.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`,
  bodyFontFamily: `${roboto.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`,
};
