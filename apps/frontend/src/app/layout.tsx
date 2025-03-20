import '../styles/globals.scss';
import { Providers } from './providers';
import { rampartOne, roboto } from '../theme/fonts';

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
            <h1 className="main-title">NOTIA</h1>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
