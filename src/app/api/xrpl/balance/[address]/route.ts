import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  
  try {
    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/xrpl/balance/${address}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('XRPL balance fetch error:', error);
    
    // 백엔드 연결 실패 시 모의 데이터 반환 (개발용)
    const mockData = {
      success: true,
      data: {
        address,
        xrp: (Math.random() * 1000).toFixed(2),
        ksc: (Math.random() * 10000).toFixed(2)
      }
    };
    
    return NextResponse.json(mockData);
  }
} 