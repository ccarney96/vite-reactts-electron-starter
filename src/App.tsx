import React, { useEffect, useState } from 'react';
import { Download, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Map } from './models/map';
import { Agent } from './models/agent';
import { Button } from './components/ui/button';
import { useToast } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';

function App() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [config, setConfig] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch('https://valorant-api.com/v1/maps'),
      fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
    ])
      .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
      .then(([data1, data2]) => {
        setMaps(data1.data);
        setAgents(data2.data);
      });
  }, []);

  useEffect(() => {
    if (window.Main) {
      // Load the config when the component mounts
      window.Main.loadConfig().then((configData) => {
        setConfig(configData);
      });
    }
  }, []);

  return (
    <div className="container mx-auto">
      <pre>{JSON.stringify(config, null, 2)}</pre>
      <Toaster />
      <div className="flex justify-between items-center mt-5 pb-5">
        <Button
          variant="outline"
          className="mr-2 w-full sm:w-auto"
          onClick={() => {
            window.Main.saveConfig(JSON.stringify(config, null, 2)).then((r) => console.log('saved config', r));
            toast({
              title: 'Config saved',
              description: 'Your config has been saved successfully.'
            });
          }}
        >
          <Save className="w-6 h-6 mr-2" />
          <span className="text-sm font-semibold">Save Config</span>
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => {
            toast({
              title: 'Config loaded',
              description: 'Your config has been loaded successfully.'
            });
          }}
        >
          <Download className="w-6 h-6 mr-2" />
          Load Config
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {maps.map((map) => (
          <Card key={map.uuid}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{map.displayName}</CardTitle>
              <img src={map.splash} alt={map.displayName} />
            </CardHeader>

            <CardContent className="flex justify-between items-center">
              <Select
                onValueChange={(value) => {
                  setConfig({ ...config, [map.uuid]: value });
                }}
                value={config[map.uuid]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.uuid} value={agent.displayName}>
                      <div className="flex items-center">
                        <img src={agent.displayIcon} alt={agent.displayName} className="w-6 h-6 mr-2" />
                        <span>{agent.displayName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>

            <CardFooter>
              <CardDescription>{map.coordinates}</CardDescription>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default App;
