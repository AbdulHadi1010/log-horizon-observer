
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



export function MonitoringView() {
 
  
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

 

  

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">System Monitoring</h1>
      </div>
<div>
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
</div>

    </div>
  );
}
