import { useState } from 'react';
import { formatAddress } from '@/utils/formatters';
import { useLanguage } from '@/contexts/localization/LanguageContext';

// 컴포넌트가 받을 props 타입 정의
interface AddressDisplayProps {
  address: string;
  full?: boolean;
}

export function AddressDisplay({ address, full = false }: AddressDisplayProps){
 const {t} = useLanguage();
 
  // 복사됨 상태를 관리하기 위한 state
  const [isCopied, setIsCopied] = useState(false);

  // 주소 복사 핸들러
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      // 2초 후에 '복사됨' 메시지를 원래대로 되돌림
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address: ', err);
    }
  };

  return (
    <div 
      className="inline-flex items-center cursor-pointer"
      title={t(`messages.copy`)} 
      onClick={handleCopy} 
    >
      <span>
        {isCopied ? 'Copied!' : (full ?  address : formatAddress(address))}
      </span>
    </div>
  );
}

