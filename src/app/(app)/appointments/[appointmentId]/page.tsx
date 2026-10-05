import { redirect } from 'next/navigation';

type Props = { params: Promise<{ appointmentId: string }> };

export default async function Page({ params }: Props) {
  const { appointmentId } = await params;
  redirect(`/enquiries/tour/${appointmentId}`);
}
