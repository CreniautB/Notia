import { Rampart_One, Roboto } from 'next/font/google';

// Police pour les titres principaux
export const rampartOne = Rampart_One({
  weight: '400', // La police Rampart One n'a généralement qu'un seul poids
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rampart-one',
});

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
  titleFontFamily: `${rampartOne.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`,
  bodyFontFamily: `${roboto.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`,
};
