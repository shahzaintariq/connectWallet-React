import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { metaMask } from '../connectors';
import { formatEther } from '@ethersproject/units';
import { useEagerConnect, useInactiveListener } from '../hooks/connect';

const Wallet = () => {
  // this hook will give you library(instance of web3.js,ethers.js) to make instance of contract, account address, chainId etc
  const {
    connector,
    library,
    account,
    chainId,
    activate,
    deactivate,
    active,
    error,
  } = useWeb3React();

  const [blockNumber, setBlockNumber] = useState(undefined);
  const [ethBalance, setEthBalance] = useState();
  const [activatingConnector, setActivatingConnector] = useState();

  let connected = connector === metaMask;
  const disabled = !!activatingConnector || connected || !!error;

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  useEffect(() => {
    if (library) {
      library.getBlockNumber().then((bn) => {
        setBlockNumber(bn);
      });
      library.on('block', setBlockNumber);
      return () => {
        library.removeListener('block', setBlockNumber);
        setBlockNumber(undefined);
      };
    }
  }, [library]);

  useEffect(() => {
    if (library && account) {
      let stale = false;
      library
        .getBalance(account)
        .then((balance) => {
          if (!stale) {
            setEthBalance(balance);
          }
        })
        .catch(() => {
          if (!stale) {
            setEthBalance(null);
          }
        });

      return () => {
        stale = true;
        setEthBalance(undefined);
      };
    }
  }, [library, account, chainId]);

  const onClickActivate = async () => {
    activate(metaMask);
    setActivatingConnector(metaMask);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ margin: '0', textAlign: 'right' }}>
        {active ? '🟢' : error ? '🔴' : '🟠'}
      </h1>
      <h3
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr min-content 1fr',
          maxWidth: '20rem',
          lineHeight: '2rem',
          margin: 'auto',
        }}
      >
        <span>Chain Id</span>
        <span role="img" aria-label="chain">
          ⛓
        </span>
        <span>{chainId === undefined ? '...' : chainId}</span>

        <span>Block Number</span>
        <span role="img" aria-label="numbers">
          🔢
        </span>

        <span>
          {blockNumber === undefined
            ? '...'
            : blockNumber === null
            ? 'Error'
            : blockNumber.toLocaleString()}
        </span>

        <span>Account</span>
        <span role="img" aria-label="robot">
          🤖
        </span>
        <span>
          {account === undefined
            ? '...'
            : account === null
            ? 'None'
            : `${account.substring(0, 6)}...${account.substring(
                account.length - 4
              )}`}
        </span>

        <span>Balance</span>
        <span role="img" aria-label="gold">
          💰
        </span>
        <span>
          {ethBalance === undefined
            ? '...'
            : ethBalance === null
            ? 'Error'
            : `Ξ${parseFloat(formatEther(ethBalance)).toPrecision(4)}`}
        </span>
      </h3>

      <button
        style={{
          height: '3rem',
          borderRadius: '1rem',
          marginTop: '5%',
          left: '40%',
          borderColor:
            activatingConnector === metaMask
              ? 'orange'
              : metaMask
              ? 'green'
              : 'unset',
          cursor: disabled ? 'unset' : 'pointer',
          position: 'relative',
        }}
        disabled={disabled}
        key={metaMask}
        onClick={() => {
          onClickActivate();
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            color: 'black',
            margin: '0 0 0 1rem',
          }}
        ></div>
        {'Connect MetaMask'}
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {(active || error) && (
          <button
            style={{
              height: '3rem',
              marginLeft: '10%',
              marginTop: '-4%',
              borderRadius: '1rem',
              borderColor: 'red',
              cursor: 'pointer',
            }}
            onClick={() => {
              deactivate();
            }}
          >
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
};

export default Wallet;
