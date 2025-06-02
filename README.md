# MOH Event Registration & QR Code System

A comprehensive event management system features secure user authentication, QR code generation, email delivery, and real-time attendance tracking for a 3-day event.

## 🌟 Features

- **User Authentication**: Secure login/signup with Supabase Auth
- **Registration Management**: Complete attendee registration system
- **QR Code Generation**: Unique QR codes for each registrant
- **Email Integration**: Automated QR code delivery via Resend
- **Attendance Tracking**: Real-time QR code scanning for daily check-ins
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Data Export**: CSV export functionality for attendance reports
- **Real-time Updates**: Live attendance statistics and reporting

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Beautiful and accessible UI components
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Backend & Database
- **Supabase**: Backend as a Service (BaaS)
  - PostgreSQL database
  - User authentication
  - Row-level security policies
  - Real-time subscriptions

### Additional Services
- **Resend**: Email delivery service for QR codes
- **QR Code**: qrcode, qr-scanner
- **File Handling**: csv-writer for data export

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or later)
2. **Supabase Account**: [Sign up here](https://supabase.com)
3. **Resend Account**: [Sign up here](https://resend.com)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moh_event
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   
   # Event Configuration
   NEXT_PUBLIC_EVENT_NAME="MOH Event 2024"
   NEXT_PUBLIC_EVENT_START_DATE="2024-03-01"
   NEXT_PUBLIC_EVENT_END_DATE="2024-03-03"
   ```

### Database Setup

1. **Create tables in Supabase**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL from `database/schema.sql`

2. **For existing databases**
   - If you have an existing database with roles, run `database/migration_remove_roles.sql`

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage

### For All Users

#### Registration
1. Navigate to the Registration tab
2. Fill in attendee details (name, email, phone, organization, position)
3. Submit the form
4. QR code is automatically generated and emailed to the attendee

#### QR Code Scanning
1. Go to the Scan QR tab
2. Allow camera permissions
3. Point camera at attendee's QR code
4. System automatically records attendance for the current day
5. Each attendee can only check in once per day

#### Reports
1. Access the Reports tab
2. View real-time attendance statistics
3. Filter by day (Day 1, Day 2, Day 3)
4. Export attendance data as CSV
5. View detailed attendee information

### System Access
- All users have full access to registration, scanning, and reporting features
- Simple authentication system without role restrictions

## 🏗️ Architecture

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Registrations Table
```sql
CREATE TABLE registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    organization TEXT NOT NULL,
    position TEXT NOT NULL,
    qr_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Attendance Table
```sql
CREATE TABLE attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES registrations(id),
    day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 3),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scanner_user_id UUID NOT NULL REFERENCES users(id),
    UNIQUE(registration_id, day)
);
```

### Security Features
- Secure authentication with RLS policies
- Email validation and sanitization
- QR code uniqueness enforcement
- Prevention of duplicate daily attendance

### Component Structure
```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── ui/                # Shadcn/UI components
│   ├── AttendanceReport.tsx
│   ├── Dashboard.tsx
│   ├── QRScanner.tsx        # QR code scanner
│   └── RegistrationForm.tsx
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── attendance.ts     # Attendance management
│   ├── email.ts          # Email service
│   ├── qr.ts            # QR code generation
│   └── supabase.ts      # Database client
└── types/                # TypeScript definitions
```

## 🔧 Configuration

### Event Settings
Modify event details in your `.env.local`:
- `NEXT_PUBLIC_EVENT_NAME`: Event title
- `NEXT_PUBLIC_EVENT_START_DATE`: Start date (YYYY-MM-DD)
- `NEXT_PUBLIC_EVENT_END_DATE`: End date (YYYY-MM-DD)

### Email Templates
Customize email templates in `src/lib/email.ts`:
- Subject line
- Email body content
- QR code attachment settings

### QR Code Format
Default format includes:
- Registration ID
- Full name
- Email
- Event information

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Node.js 18+ support
- Set environment variables
- Build command: `npm run build`
- Start command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the excellent BaaS platform
- [Shadcn/UI](https://ui.shadcn.com) for the beautiful component library
- [Resend](https://resend.com) for reliable email delivery
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

---

⚡ **Quick Start**: Clone → Install → Configure → Deploy

For questions or support, please open an issue in the repository.
