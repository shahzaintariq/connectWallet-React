import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import Wallet from './components/Wallet'

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;
  return library;
}



function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary} >
      <Wallet />
    </Web3ReactProvider>
  );
}

export default App;
