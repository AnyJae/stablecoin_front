import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    // 실제 구현에서는 백엔드 API 호출
    // const response = await fetch(`${process.env.BACKEND_URL}/api/transactions/${address}`);
    
    // 임시 모의 데이터
    const mockTransactions = [
      {
        hash: '0x' + Math.random().toString(36).substring(2, 15),
        from: address,
        to: '0x' + Math.random().toString(36).substring(2, 15),
        amount: (Math.random() * 1000).toFixed(2),
        currency: 'KSC',
        timestamp: Date.now() - Math.random() * 86400000 * 7, // 최근 7일 내
        status: Math.random() > 0.2 ? 'confirmed' : 'pending'
      },
      {
        hash: '0x' + Math.random().toString(36).substring(2, 15),
        from: '0x' + Math.random().toString(36).substring(2, 15),
        to: address,
        amount: (Math.random() * 500).toFixed(2),
        currency: 'KSC',
        timestamp: Date.now() - Math.random() * 86400000 * 14, // 최근 14일 내
        status: 'confirmed'
      }
    ];

    return NextResponse.json({ transactions: mockTransactions });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: '거래 내역 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
} 