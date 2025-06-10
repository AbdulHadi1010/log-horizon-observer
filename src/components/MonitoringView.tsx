
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, Cpu, HardDrive, Wifi } from "lucide-react";

const cpuData = [
  { time: "14:25", value: 45 },
  { time: "14:26", value: 52 },
  { time: "14:27", value: 48 },
  { time: "14:28", value: 61 },
  { time: "14:29", value: 55 },
  { time: "14:30", value: 67 },
  { time: "14:31", value: 72 },
  { time: "14:32", value: 58 }
];

const memoryData = [
  { time: "14:25", value: 62 },
  { time: "14:26", value: 65 },
  { time: "14:27", value: 63 },
  { time: "14:28", value: 68 },
  { time: "14:29", value: 71 },
  { time: "14:30", value: 69 },
  { time: "14:31", value: 74 },
  { time: "14:32", value: 76 }
];

const networkData = [
  { time: "14:25", in: 125, out: 89 },
  { time: "14:26", in: 142, out: 95 },
  { time: "14:27", in: 138, out: 102 },
  { time: "14:28", in: 156, out: 118 },
  { time: "14:29", in: 149, out: 112 },
  { time: "14:30", in: 167, out: 125 },
  { time: "14:31", in: 172, out: 134 },
  { time: "14:32", in: 159, out: 128 }
];

export function MonitoringView() {
  const metrics = [
    {
      title: "CPU Usage",
      value: "58%",
      change: "+5%",
      icon: Cpu,
      status: "normal"
    },
    {
      title: "Memory Usage", 
      value: "76%",
      change: "+12%",
      icon: Activity,
      status: "warning"
    },
    {
      title: "Disk Usage",
      value: "45%",
      change: "+2%",
      icon: HardDrive,
      status: "normal"
    },
    {
      title: "Network I/O",
      value: "159 MB/s",
      change: "-8%",
      icon: Wifi,
      status: "normal"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cluster Monitoring</h2>
        <Badge variant="default" className="animate-pulse">
          Real-time
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last hour
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="in" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Inbound"
                />
                <Line 
                  type="monotone" 
                  dataKey="out" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Outbound"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
