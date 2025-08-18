enum Subject {
  mathematics = "mathematics",
  english = "english",
  hindi = "hindi",
  physics = "physics",
  chemistry = "chemistry",
  biology = "biology",
  computer_science = "computer_science",
  informatics_practices = "informatics_practices",
  economics = "economics",
  accountancy = "accountancy",
  business_studies = "business_studies",
  political_science = "political_science",
  geography = "geography",
  history = "history",
  psychology = "psychology",
  sociology = "sociology",
  physical_education = "physical_education",
}

type Companion = Models.DocumentList<Models.Document> & {
  $id: string;
  name: string;
  subject: Subject;
  topic: string;
  duration: number;
  bookmarked: boolean;
};

interface CreateCompanion {
  name: string;
  subject: string;
  topic: string;
  style: string;
  duration: number;
}

interface GetAllCompanions {
  limit?: number;
  page?: number;
  subject?: string | string[];
  topic?: string | string[];
}

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  style: string;
}

interface CompanionConfig {
  subject: string;
  topic: string;
  style: string;
  name: string;
}

interface CompanionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface VoiceConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}