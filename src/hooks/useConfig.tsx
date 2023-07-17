import React, { useState } from 'react';
import { toast } from '../components/ui/use-toast';

type Config = {
  [key: string]: string;
};

type useConfigProps = {
  config: Config;
  saveConfig: (configData: Config) => void; // Changed the return type to void
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  loadConfig: () => void;
};

const useConfig = (): useConfigProps => {
  const [config, setConfig] = useState<Config>({});

  const saveConfig = (configData: Config) => {
    if (window.Main) {
      const configData2 = JSON.stringify(configData, null, 2); // Convert config data to string
      window.Main.saveConfig(configData2)
        .then((configRes: string) => {
          toast({
            title: 'Config saved',
            description: 'Your config has been saved successfully.'
          });
        })
        .catch((error) => {
          // Handle error if saveConfig fails
          console.error('Error saving config:', error);
          toast({
            title: 'Error',
            description: 'Could not save config. Please try again.',
            variant: 'destructive'
          });
        });
    }
  };

  const loadConfig = () => {
    if (window.Main) {
      // Load the config when the component mounts
      window.Main.loadConfig()
        .then((configData) => {
          const config2 = JSON.parse(configData) as Config; // Type assertion for parsed data
          setConfig(config2);
          toast({
            title: 'Config loaded',
            description: 'Your config has been loaded successfully.',
          });
        })
        .catch((error) => {
          // Handle error if loadConfig fails
          console.error('Error loading config:', error);
          toast({
            title: 'Error',
            description: 'Could not load config. Please restart the app.',
            variant: 'destructive'
          });
        });
    } else {
      toast({
        title: 'Error',
        description: 'Could not load config. Please restart the app.'
      });
    }
  };

  return { config, saveConfig, setConfig, loadConfig };
};

export default useConfig;
