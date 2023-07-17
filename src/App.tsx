import React, { useEffect, useState } from 'react';
import { Download, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Map } from './models/map';
import { Agent } from './models/agent';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toaster';
import useConfig from './hooks/useConfig';

function App() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const { config, saveConfig, setConfig, loadConfig } = useConfig();

  useEffect(() => {
    Promise.all([
      fetch('https://valorant-api.com/v1/maps'),
      fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
    ])
      .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
      .then(([data1, data2]) => {
        setMaps(data1.data);
        setAgents(data2.data);
        loadConfig();
      });
  }, []);

  return (
    <div className="container mx-auto">
      <Toaster />
      <div className="flex justify-between items-center mt-5 pb-5">
        <Button
          variant="outline"
          className="mr-2 w-full sm:w-auto"
          onClick={() => {
            saveConfig(config);
          }}
        >
          <Save className="w-6 h-6 mr-2" />
          <span className="text-sm font-semibold">Save Config</span>
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={loadConfig}>
          <Download className="w-6 h-6 mr-2" />
          Load Config
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {maps.map((map) => (
          <Card key={map.uuid}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{map.displayName}</CardTitle>
              {/* <img src={map.splash} alt={map.displayName} /> */}
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
                        <img
                          className="w-4 h-4 mr-2 rounded-full"
                          src={agent.displayIcon}
                          alt={agent.displayName}
                        />
                        {agent.displayName}
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
