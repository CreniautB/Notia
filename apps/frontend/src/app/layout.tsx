import '../styles/globals.scss';
import { Providers } from './providers';
import { rampartOne, roboto } from '../theme/fonts';
import { ContentCard } from '../components/ContentCard';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${rampartOne.variable} ${roboto.variable}`}>
      <body className={roboto.className}>
        <Providers>
          <header>
            <ContentCard>
              <h1 className="main-title">NOTIA</h1>
            </ContentCard>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
