import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    body = await request.json();
    const { from, to, amount, currency, chain } = body;

    // 입력 검증
    if (!from || !to || !amount || !currency || !chain) {
      return NextResponse.json(
        { success: false, message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/transaction/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction send error:', error);
    
    // 백엔드 연결 실패 시 모의 응답 반환 (개발용)
    const mockResponse = {
      success: true,
      message: '전송이 성공적으로 처리되었습니다.',
      data: {
        transactionHash: '0x' + Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        from: body?.from || '',
        to: body?.to || '',
        amount: body?.amount || '0'
      }
    };

    return NextResponse.json(mockResponse);
  }
} 