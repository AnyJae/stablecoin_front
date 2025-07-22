import{ useState, useEffect } from 'react';

 // 현재 시간 이후의 날짜/시간만 선택 가능한 datetime-local 입력 필드 컴포넌트

export function FutureDateTimePicker({ _value, _onChange, className = '' }) {
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    // 현재 날짜와 시간을 YYYY-MM-DDTHH:mm 형식으로 포맷팅
    const getFormattedCurrentDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); 
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setMinDateTime(getFormattedCurrentDateTime());

  }, []); 

  return (
    <input
      type="datetime-local"
      value={_value}
      onChange={_onChange}
      min={minDateTime} 
      className={`w-full px-4 py-3 bg-ksc-gray rounded-lg border border-ksc-gray-light focus:border-2 focus:border-ksc-mint focus:ring-0 focus:outline-none ${className}`}
      required
    />
  );
}