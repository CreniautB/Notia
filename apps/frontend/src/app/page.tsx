import { redirect } from 'next/navigation';

export default function Home() {
  // Rediriger vers la page des quiz
  redirect('/quiz');
}
