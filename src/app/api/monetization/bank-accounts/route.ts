import { NextResponse } from 'next/server';
import { addBankAccount } from '@/lib/platform/monetization';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string' || typeof body.bankName !== 'string' || typeof body.last4 !== 'string') {
    return NextResponse.json({ error: 'creatorId, bankName, and last4 are required' }, { status: 400 });
  }
  if (!/^\d{4}$/.test(body.last4)) {
    return NextResponse.json({ error: 'last4 must be exactly 4 digits' }, { status: 400 });
  }
  const bankAccount = addBankAccount(body.creatorId, body.bankName, body.last4);
  return NextResponse.json({ success: true, bankAccount });
}
