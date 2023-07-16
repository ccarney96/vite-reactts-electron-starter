import React, { useEffect, useState } from 'react';
import { Button } from './components/button';

function App() {
  console.log(window.ipcRenderer);

  const [isOpen, setOpen] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);

  const handleToggle = () => {
    if (isOpen) {
      setOpen(false);
      setSent(false);
    } else {
      setOpen(true);
      setFromMain(null);
    }
  };
  const sendMessageToElectron = () => {
    if (window.Main) {
      window.Main.sendMessage("Hello I'm from React World");
    } else {
      setFromMain('You are in a Browser, so no Electron functions are available');
    }
    setSent(true);
  };

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-4xl font-bold">Hello World</h1>
        <p className="text-xl">This is a React App</p>
        <p className="text-xl">{fromMain}</p>
        <Button onClick={handleToggle} className="mb-4">
          Toggle
        </Button>
        <Button onClick={sendMessageToElectron}>Send Message</Button>
      </div>
    </div>
  );
}

export default App;
