
#!/usr/bin/env node

const SUPABASE_URL = "https://dedjxngllokyyktaklmz.supabase.co";

async function seedDemoData() {
  console.log('🌱 Seeding demo data for Resolvix...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/seed-demo-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Demo data seeded successfully!\n');
      console.log('Test Users Created:');
      console.log('==================');
      
      const users = [
        { name: "Alice Admin", email: "alice.admin@example.com", role: "admin", password: "Test@1234" },
        { name: "Eddie Engineer", email: "eddie.engineer@example.com", role: "engineer", password: "Test@1234" },
        { name: "Vera Viewer", email: "vera.viewer@example.com", role: "viewer", password: "Test@1234" }
      ];
      
      users.forEach(user => {
        console.log(`👤 ${user.name} (${user.role})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}\n`);
      });
      
      console.log('🎯 Sample Data Created:');
      console.log('• 4 tickets with realistic descriptions');
      console.log('• Chat history between users');
      console.log('• Error and info logs');
      console.log('• AI recommendations\n');
      
      console.log('🚀 You can now log in at: /login');
      
    } else {
      console.error('❌ Failed to seed demo data:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error.message);
    process.exit(1);
  }
}

// Run the script
seedDemoData();
</tml-write>

Let me also update the README.md to document the new seeding functionality:

<lov-write file_path="README.md">
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c846d5e9-0cb3-4206-89b9-3653764df2c1

## Demo Setup

### Seed Demo Data

Resolvix includes a comprehensive demo data seeding system that creates realistic test users and sample data for presentations and testing.

#### Using the Web Interface

1. Navigate to `/dev-setup` in your browser
2. Go to the "Demo Data" tab
3. Click "Seed Demo Data" to create all test users and sample data

#### Using the CLI Script

```bash
# Run the demo seeding script
node scripts/seed-demo.js
```

#### Test Users Created

The seeding process creates three test users:

| User | Email | Role | Password |
|------|-------|------|----------|
| Alice Admin | alice.admin@example.com | admin | Test@1234 |
| Eddie Engineer | eddie.engineer@example.com | engineer | Test@1234 |
| Vera Viewer | vera.viewer@example.com | viewer | Test@1234 |

#### Sample Data Included

- **4 Tickets**: Mix of open, closed, and in-progress tickets
- **Sample Logs**: Error and info level logs with realistic metadata
- **Chat History**: 3-5 messages per ticket showing user collaboration
- **AI Recommendations**: 1-2 AI-generated suggestions per ticket
- **Realistic Tags**: Auto-generated tags like 'error', 'payment', 'security'

The seeding process is **idempotent** - safe to run multiple times. Each run clears existing demo data and recreates it fresh.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c846d5e9-0cb3-4206-89b9-3653764df2c1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c846d5e9-0cb3-4206-89b9-3653764df2c1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
