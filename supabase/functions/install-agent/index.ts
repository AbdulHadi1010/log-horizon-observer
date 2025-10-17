import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { machineIp, username, password, logPaths } = await req.json();

    console.log(`Installing Resolvix agent on ${machineIp}`);

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Generate agent configuration
    const agentConfig = {
      supabaseUrl,
      supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY')!,
      machineIp,
      logPaths: logPaths || ['/var/log/syslog', '/var/log/messages'],
      uploadInterval: 5000, // 5 seconds
    };

    // In a real implementation, you would:
    // 1. SSH into the machine
    // 2. Copy the agent script
    // 3. Create the config file with the above configuration
    // 4. Set up the agent as a systemd service
    // 5. Start the service

    // For now, we'll return the installation instructions
    const installScript = generateInstallScript(agentConfig);

    console.log('Agent installation script generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Agent installation initiated',
        installScript,
        agentConfig
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error installing agent:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateInstallScript(config: any): string {
  return `#!/bin/bash
# Resolvix Agent Installation Script

echo "Installing Resolvix Agent..."

# Create agent directory
sudo mkdir -p /opt/resolvix
cd /opt/resolvix

# Download agent script
cat > /opt/resolvix/resolvix-agent.py << 'EOF'
${generateAgentPython(config)}
EOF

# Create config file
cat > /opt/resolvix/config.json << 'EOF'
${JSON.stringify(config, null, 2)}
EOF

# Make script executable
sudo chmod +x /opt/resolvix/resolvix-agent.py

# Install Python dependencies
sudo apt-get update
sudo apt-get install -y python3 python3-pip
sudo pip3 install requests watchdog

# Create systemd service
cat > /etc/systemd/system/resolvix-agent.service << 'EOFSERVICE'
[Unit]
Description=Resolvix Log Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/resolvix
ExecStart=/usr/bin/python3 /opt/resolvix/resolvix-agent.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOFSERVICE

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable resolvix-agent
sudo systemctl start resolvix-agent

echo "Resolvix Agent installed and started successfully!"
echo "Check status with: sudo systemctl status resolvix-agent"
`;
}

function generateAgentPython(config: any): string {
  return `#!/usr/bin/env python3
import json
import os
import time
import re
import requests
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class LogMonitor(FileSystemEventHandler):
    def __init__(self, config):
        self.config = config
        self.supabase_url = config['supabaseUrl']
        self.api_key = config['supabaseAnonKey']
        self.machine_ip = config['machineIp']
        self.file_positions = {}
        
    def on_modified(self, event):
        if event.is_directory:
            return
        
        log_path = event.src_path
        if log_path in self.config['logPaths']:
            self.process_log_file(log_path)
    
    def process_log_file(self, log_path):
        try:
            # Get last read position
            last_pos = self.file_positions.get(log_path, 0)
            
            with open(log_path, 'r') as f:
                f.seek(last_pos)
                new_lines = f.readlines()
                new_pos = f.tell()
            
            if new_lines:
                self.send_logs_to_supabase(log_path, new_lines)
                self.file_positions[log_path] = new_pos
                
        except Exception as e:
            print(f"Error processing {log_path}: {e}")
    
    def send_logs_to_supabase(self, log_path, lines):
        logs = []
        for line in lines:
            log_entry = self.parse_log_line(line.strip())
            if log_entry:
                logs.append({
                    'machine_ip': self.machine_ip,
                    'log_path': log_path,
                    'level': log_entry['level'],
                    'message': log_entry['message'],
                    'timestamp': log_entry['timestamp']
                })
        
        if logs:
            try:
                url = f"{self.supabase_url}/rest/v1/live_logs"
                headers = {
                    'apikey': self.api_key,
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
                
                response = requests.post(url, json=logs, headers=headers)
                if response.status_code in [200, 201]:
                    print(f"Sent {len(logs)} log entries to Supabase")
                else:
                    print(f"Error sending logs: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Error sending to Supabase: {e}")
    
    def parse_log_line(self, line):
        if not line:
            return None
        
        # Detect log level
        level = 'info'
        if 'ERROR' in line.upper() or 'ERR' in line.upper():
            level = 'error'
        elif 'WARN' in line.upper():
            level = 'warn'
        elif 'DEBUG' in line.upper():
            level = 'debug'
        
        return {
            'level': level,
            'message': line,
            'timestamp': datetime.utcnow().isoformat()
        }

def main():
    # Load configuration
    with open('/opt/resolvix/config.json', 'r') as f:
        config = json.load(f)
    
    print(f"Starting Resolvix Agent for {config['machineIp']}")
    print(f"Monitoring logs: {config['logPaths']}")
    
    # Create log monitor
    monitor = LogMonitor(config)
    
    # Set up file system observer
    observer = Observer()
    for log_path in config['logPaths']:
        if os.path.exists(log_path):
            observer.schedule(monitor, os.path.dirname(log_path), recursive=False)
            # Process existing content
            monitor.process_log_file(log_path)
        else:
            print(f"Warning: Log file not found: {log_path}")
    
    # Start monitoring
    observer.start()
    print("Agent started successfully. Monitoring log files...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("Agent stopped")
    
    observer.join()

if __name__ == '__main__':
    main()
`;
}
