import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ekalavya.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  // Basic Information
  applicationName: "Ekalavya - The Future of Learning",
  title: {
    default: "Ekalavya: The Future of Learning",
    template: `%s - Ekalavya`,
  },
  description:
    "Ekalavya is an AI-powered learning platform that provides personalized teaching companions, interactive study materials, and smart quizzes. Designed for CBSE and ICSE students, with expansion to global curriculums. Learn smarter with real-time AI voice guidance, adaptive study plans, and engaging assessments.",

  keywords: [
    // Core Brand & Mission
    "Ekalavya", "Ekalavya AI", "Ekalavya Learning Platform",
    "AI Learning Companion", "AI Teaching Assistant",
    "Future of Learning", "AI Voice Tutor", "Personalized Education",

    // Features
    "AI Study Companion", "Interactive Study Materials", "CBSE Quizzes",
    "ICSE Quizzes", "Smart Assessments", "Adaptive Learning",
    "AI Voice Agent", "Virtual Classroom", "AI Education Assistant",
    "Gamified Learning", "Study Planner AI", "Real-Time AI Tutor",

    // Target Users
    "CBSE Students", "ICSE Students", "School Learning Platform",
    "High School Study Materials", "Exam Preparation",
    "AI Teacher for Students", "Personal Learning Companion",

    // Education Expansion
    "Global Curriculum", "NCERT Solutions", "Board Exam Preparation",
    "Practice Tests", "Online Education Platform", "EdTech Innovation",

    // Technologies
    "AI in Education", "Voice AI Learning", "Adaptive EdTech",
    "Next.js Education Platform", "Clerk Auth", "Supabase", "PostgreSQL",

    // Industry Keywords
    "EdTech Platform", "Learning App", "Smart Education",
    "AI Tutoring System", "Online Study Tools", "Digital Classroom",
    "Self Learning AI", "AI Quiz Generator", "AI Notes Assistant",

    // Location & Accessibility
    "Learning in India", "Remote Education", "Online Learning AI",
    "Accessible Education Platform", "Future Classrooms"
  ],

  // Author & Publisher
  authors: [{ name: "Ekalavya Team", url: baseUrl }],
  creator: "Ekalavya AI",
  publisher: "Ekalavya AI",

  // Icons
  icons: {
    icon: [
      { url: "/images/logo.svg", sizes: "32x32", type: "image/png" },
      { url: "/images/logo.svg", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/images/logo.svg",
    apple: [{ url: "/images/logo.svg", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/images/logo.svg", sizes: "192x192", type: "image/png" },
    ],
  },

  // Open Graph (Social Sharing)
  openGraph: {
    title: "Ekalavya: The Future of Learning",
    description:
      "Experience the next-generation learning platform with Ekalavya. Powered by AI, offering personalized companions, interactive study materials, and engaging quizzes for CBSE, ICSE, and beyond.",
    url: baseUrl,
    siteName: "Ekalavya",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Ekalavya - AI Learning Companion",
        type: "image/png",
      },
      {
        url: `${baseUrl}/opengraph-image-square.png`,
        width: 600,
        height: 600,
        alt: "Ekalavya Logo",
        type: "image/png",
      },
    ],
    emails: ["support@ekalavya.ai"],
    countryName: "India",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@ekalavya_ai",
    creator: "@ekalavya_ai",
    title: "Ekalavya: The Future of Learning",
    description:
      "AI-powered teaching companion for students | Personalized voice tutor | Smart quizzes & study materials | Currently for CBSE & ICSE, expanding worldwide 🚀",
    images: {
      url: `${baseUrl}/opengraph-image.png`,
      alt: "Ekalavya AI Learning",
      width: 1200,
      height: 630,
    },
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-US": baseUrl,
      en: baseUrl,
    },
  },

  // Additional Metadata
  category: "Education",
  classification: "AI Learning Platform",

  // Verification
  verification: {
    google: "your-google-verification-code",
    // Add Bing, Yandex, etc. if needed
  },

  other: {
    "theme-color": "#fe5933",
    "color-scheme": "dark light",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#fe5933",
    "msapplication-config": "/browserconfig.xml",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <ClerkProvider appearance={{ variables: { colorPrimary: '#fe5933' }} }>
          <Navbar />
          {children}
        </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}