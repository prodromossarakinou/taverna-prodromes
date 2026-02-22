import { HomeClient } from '@/components/features/root/HomeClient';

// Αφαιρούμε την πρόσβαση σε searchParams στο server.
// Το HomeClient θα διαχειρίζεται πλήρως το view στην πλευρά του client.
export default function Page() {
  return <HomeClient />;
}
