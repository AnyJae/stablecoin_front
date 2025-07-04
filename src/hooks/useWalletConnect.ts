import { useLanguage } from "@/contexts/localization/LanguageContext";
import { useWalletContext } from "@/contexts/wallet/WalletContext";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useWalletConnect=()=> {
  const { t } = useLanguage();
  const {setAddress, setIsConnected, setChain, setIsMock, setIsLoading, setError } = useWalletContext();

  //Avalanche 지갑 연결
  const connectAvalancheWallet = useCallback(async()=>{
    setIsLoading(true);
    try{
      if(typeof window.ethereum !== 'undefined'){
        // 계정 요청
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('지갑 연결이 거부되었습니다.');
        }
        
        const address = accounts[0];

        
        // 네트워크 확인 및 전환
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });

        
        // Avalanche Fuji 테스트넷 (Chain ID: 43113)
        const targetChainId = '0xa869'; // 43113 in hex
        
        if (chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChainId }],
            });
          } catch (switchError: any) {
            // 네트워크가 없는 경우 추가
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: 'Avalanche Fuji Testnet',
                  nativeCurrency: {
                    name: 'AVAX',
                    symbol: 'AVAX',
                    decimals: 18
                  },
                  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://testnet.snowtrace.io']
                }]
              });
            } else {
              throw switchError;
            }
          }
        }
        setAddress(address);
        setIsConnected(true);
        setChain("avalanche");
        setIsMock(false);
        setIsLoading(false);

        toast.success(t(`wallet.connection.avalanche.connect`));
      
          // 계정 변경 이벤트 리스너
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        console.log("계정 변경");
        if (newAccounts.length === 0) {
          setAddress(address);
          setIsConnected(false);
          setChain(null);
          toast.success(t(`messages.walletDisconnected`));
        } else {
          setAddress(newAccounts[0]);
          toast.success(t(`messages.accountChanged`));
        }
      });
      
      // 체인 변경 이벤트 리스너
      window.ethereum.on('chainChanged', (newChainId: string) => {
        console.log("체인 변경");
        if (newChainId !== targetChainId) {
          setError('올바른 네트워크로 전환해주세요.');
          toast.error(t(`errors.invalidNetwork`));
        }
      });
      }
    } catch(e){
      const errorMessage = e instanceof Error ? e.message : 'Avalanche 지갑 연결에 실패했습니다.';
      setError(errorMessage);
      toast.error(t('errors.walletConnection'));
      console.error('Avalanche wallet connection error:', e);
    
    } finally {
      setIsLoading(false);
    }   


  },[])

  //XRPL 지갑 연결
    const connectXRPLWallet = useCallback(async () => {
      setIsLoading(true);
      
      try {
        // XUMM SDK 또는 xrpl.js를 사용한 실제 연결
        if (typeof window !== 'undefined' && (window as any).xumm) {
          // XUMM 지갑 연결
          const xumm = (window as any).xumm;
          const account = await xumm.user.account;
          
          if (!account) {
            throw new Error('XUMM 지갑 연결이 필요합니다.');
          }
          
          setAddress(account);
          setIsConnected(true);
          setChain("xrpl");
          setIsMock(false);
          setIsLoading(false);

          toast.success(t(`wallet.connection.xrpl.connect`));
          
        } 
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'XRPL 지갑 연결에 실패했습니다.';
        setError(errorMessage);
        toast.error(`error.walletConnection`);
        console.error('XRPL wallet connection error:', err);
      } finally {
        setIsLoading(false);
      }
    }, []);

  //지갑 연결 해제
  const disconnectWallet = useCallback(() => {

    setAddress('');
    setIsConnected(false);
    setChain(null);

    toast.success('지갑 연결이 해제되었습니다.');
  }, []);

return{
  connectAvalancheWallet,
  connectXRPLWallet,
  disconnectWallet
};
}