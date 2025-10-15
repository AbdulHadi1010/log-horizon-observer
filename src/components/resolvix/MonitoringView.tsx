
import { useState,useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/integrations/supabase/client";

interface NodeInfo {
  id: string;
  Hostname: string;
  OS: string;
  OS_Version: string;
  OS_Release: string;
  Machine_Architecture: string;
  MAC_address: string;
  IP_address: string;
  Total_RAM_GB: number;
  Total_Disk_GB: number;
  Disk_Used_GB: number;
  Disk_Free_GB: number;
  Disk_Usage_Percentage: number;
  CPU_Physical_Core: number;
  CPU_logical_Core: number;
}



import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Server, 
  /*Database,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive*/
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: string;
  lastChecked: string;
}

/*interface SystemMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
}*/

export function MonitoringView() {
  const [services] = useState<ServiceStatus[]>([
    {
      id: '1',
      name: 'API Gateway',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms',
      lastChecked: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '45ms',
      lastChecked: '1 minute ago'
    },
    {
      id: '3',
      name: 'Log Processor',
      status: 'warning',
      uptime: '98.5%',
      responseTime: '300ms',
      lastChecked: '30 seconds ago'
    },
    {
      id: '4',
      name: 'Authentication Service',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '80ms',
      lastChecked: '1 minute ago'
    }
  ]);
  
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Fetch nodes from Supabase
  useEffect(() => {
    const fetchNodes = async () => {
      const { data, error } = await supabase
        .from("system_info")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching nodes:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setNodes(data);
        setSelectedNode(data[0]); // default select first node
      }

      setLoading(false);
    };

    fetchNodes();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <Button>
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <Server className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  10 healthy, 2 warnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.2%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">150ms</div>
                <p className="text-xs text-muted-foreground">
                  Average across all services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  2 warnings, 1 critical
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <CardDescription>Last checked: {service.lastChecked}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="ml-2 font-medium">{service.uptime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="ml-2 font-medium">{service.responseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

<TabsContent value="metrics" className="space-y-6">
  {loading ? (
    <p>Loading nodes...</p>
  ) : (
    <div className="space-y-2">
      {nodes.map((node, index) => {
        const isExpanded = expandedNodeId === node.id;
        return (
          <div key={node.id} className="border rounded-lg">
            {/* Node header (clickable) */}
            <button
              className="w-full text-left p-3 flex justify-between items-center"
              onClick={() =>
                setExpandedNodeId(isExpanded ? null : node.id)
              }
            >
              <span className="font-medium">Node {index + 1}</span>
              <span>{isExpanded ? '-' : '+'}</span>
            </button>

            {/* Node details */}
            {isExpanded && (
              <div className="w-full text-left p-3">
                <div><strong>Hostname:</strong> {node.Hostname}</div>
                <div><strong>OS:</strong> {node.OS} {node.OS_Version} ({node.OS_Release})</div>
                <div><strong>Machine Architecture:</strong> {node.Machine_Architecture}</div>
                <div><strong>MAC Address:</strong> {node.MAC_address}</div>
                <div><strong>IP Address:</strong> {node.IP_address}</div>
                <div><strong>Total RAM (GB):</strong> {node.Total_RAM_GB}</div>
                <div><strong>Total Disk (GB):</strong> {node.Total_Disk_GB}</div>
                <div><strong>Disk Used (GB):</strong> {node.Disk_Used_GB}</div>
                <div><strong>Disk Free (GB):</strong> {node.Disk_Free_GB}</div>
                <div><strong>Disk Usage %:</strong> {node.Disk_Usage_Percentage}%</div>
                <div><strong>CPU Physical Cores:</strong> {node.CPU_Physical_Core}</div>
                <div><strong>CPU Logical Cores:</strong> {node.CPU_logical_Core}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</TabsContent>



        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>System alerts and notifications from the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="font-medium">High Memory Usage</p>
                    <p className="text-sm text-muted-foreground">Memory usage exceeded 80% threshold</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="font-medium">Service Timeout</p>
                    <p className="text-sm text-muted-foreground">Log processor experiencing timeouts</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Critical</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
