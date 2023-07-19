import React, { useEffect, useState } from 'react';
import { Download, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Map } from './models/map';
import { Agent } from './models/agent';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toaster';
import useConfig from './hooks/useConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { cn } from './lib/utils';
import { toast } from './components/ui/use-toast';

type Tab = {
  id: string;
  label: string;
};

const tabs: Tab[] = [
  { id: 'agents', label: 'Agents' },
  { id: 'maps', label: 'Maps' }
];

function App() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTab, setSelectedTab] = useState('agents');

  const { config, saveConfig, setConfig, loadConfig } = useConfig();

  useEffect(() => {
    if (window.Main) {
      window.Main.getLockfile().then((r) => {
        console.log(r);
        toast({
          title: 'Lockfile',
          description: 'Successfully got lockfile.'
        });
      });
    }
  }, []);

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

      <Tabs
        value={selectedTab}
        onValueChange={(e) => {
          console.log(e);
          setSelectedTab(e);
        }}
        className="w-full"
      >
        <TabsList className="flex justify-between items-center">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`${cn('w-full', selectedTab === tab.id ? 'bg-primary-foreground' : '')}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="agents">
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
        </TabsContent>
        <TabsContent value="maps">
          <div>
            <h1>Maps</h1>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
