import { useQuery } from '@tanstack/react-query';
import { listGifts } from '@/api/gifts';
import { Spinner } from '@/components/ui/Spinner';
import { GiftCard } from './GiftCard';
import { WinnersHistory } from './WinnersHistory';

export default function TeacherGifts() {
  const { data, isLoading } = useQuery({ queryKey: ['gifts'], queryFn: listGifts });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gifts &amp; Rewards</h1>
        <p className="mt-1 text-sm text-slate-500">Compete for real prizes by buying the most books.</p>
      </div>

      {isLoading && <Spinner />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((gift, i) => <GiftCard key={gift.id} gift={gift} index={i} />)}
      </div>

      <WinnersHistory />
    </div>
  );
}
