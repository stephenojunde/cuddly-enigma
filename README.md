# Tutelage Services - Education Recruitment Platform

A comprehensive Next.js-based platform for educational recruitment and tutoring services, connecting schools with qualified teachers and providing tutoring services to students.

## 🚀 Features

### For Schools
- **Teacher Recruitment**: Find qualified teachers, teaching assistants, and support staff
- **Supply Teacher Services**: Quick access to cover teachers and supervisors
- **School Dashboard**: Manage job postings, applications, and staff requirements

### For Teachers
- **Job Search**: Browse and apply for teaching positions
- **Profile Management**: Showcase qualifications and experience
- **Application Tracking**: Monitor application status and communications

### For Parents & Students
- **Tutor Matching**: Find qualified tutors for various subjects
- **In-Home & Virtual Tuition**: Flexible learning options
- **Progress Tracking**: Monitor student development and achievements

### For Administrators
- **User Management**: Comprehensive admin dashboard
- **Content Management**: Manage platform content and resources
- **System Monitoring**: Track platform performance and usage

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Deployment**: Vercel-ready
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/stephenmayowa112/cuddly-enigma.git
   cd cuddly-enigma
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` folder in order:
     ```sql
     -- Run these in your Supabase SQL editor
     scripts/001_create_tables_fixed.sql
     scripts/002_setup_security.sql
     scripts/003_seed_sample_data.sql
     scripts/004_create_functions.sql
     scripts/006_dashboard_tables.sql
     scripts/007_additional_tables.sql
     scripts/008_admin_features.sql
     scripts/009_fix_profiles_table.sql  -- Important: Run this to fix signup issues
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂 Project Structure

```
tutumy/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── admin/             # Admin pages
│   ├── dashboard/         # User dashboards
│   ├── jobs/              # Job listings
│   ├── schools/           # School services
│   ├── parents/           # Parent/student services
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── public/               # Static assets
│   └── images/          # Platform images and logos
├── scripts/              # Database setup scripts
└── ...
```

## 🎨 Key Pages

- **Homepage** (`/`): Platform overview and featured tutors
- **Schools** (`/schools`): Teacher recruitment services
- **Jobs** (`/jobs`): Job listings and applications
- **Parents** (`/parents`): Tutoring services
- **About** (`/about`): Company information and values
- **Dashboard** (`/dashboard`): User-specific dashboards

## 🔧 Configuration

### Environment Variables

The platform requires several environment variables. See `.env.example` for a complete list:

- **Required**: Supabase URL and API keys
- **Optional**: Payment processing, email services, file upload services

### Database Schema

The platform uses a comprehensive PostgreSQL schema with tables for:
- Users and authentication
- Schools and job postings
- Tutors and student profiles
- Bookings and messaging
- Admin and system management

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Tutelage Services Ltd.

## 📞 Support

For support and inquiries:
- **Email**: info.badru@tutelageservices.co.uk
- **Phone**: +442036756199, +447503567466
- **Address**: 850 Cleckheaton Road Oakenshaw, Bradford. BD12 7AA

## 🏢 About Tutelage Services

Founded on 7th May 2005, Tutelage Services Ltd. is a leading education recruitment agency helping teachers and support staff find their next role in schools across the UK. We provide comprehensive educational support to schools, teachers, and parents.

---

**Built with ❤️ by the Tutelage Services team**