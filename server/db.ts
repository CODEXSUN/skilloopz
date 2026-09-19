import path from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { Kysely, SqliteDialect } from "kysely";

const databasePath = path.resolve(process.env.SQLITE_PATH ?? "data/skillloopz.sqlite");
mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new DatabaseSync(databasePath);
sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

// Kysely's SQLite driver uses the better-sqlite3 call convention.
const database = {
  prepare(sql: string) {
    const statement = sqlite.prepare(sql);
    return {
      reader: statement.columns().length > 0,
      all: (parameters: readonly unknown[]) => statement.all(...parameters as SQLInputValue[]),
      run: (parameters: readonly unknown[]) => statement.run(...parameters as SQLInputValue[]),
      iterate: (parameters: readonly unknown[]) => statement.iterate(...parameters as SQLInputValue[]),
    };
  },
  close: () => sqlite.close(),
};

export interface ProfileTable {
  id: string;
  email: string;
  full_name: string | null;
  password_hash: string;
  role: string;
  status: string;
  age_group: string | null;
  avatar_url: string | null;
  onboarding_completed: number;
  metadata: string;
  created_at: string;
}

export interface SessionTable {
  id: string;
  user_id: string;
  expires_at: string;
}

export interface CourseTable {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  teacher_id: string;
  category_id: string | null;
  difficulty: string;
  estimated_minutes: number | null;
  status: string;
  subject: string | null;
  grade_level: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface EnrollmentTable {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  archived: number;
  created_at: string;
}

export interface ModuleTable {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface LessonTable {
  id: string;
  module_id: string;
  title: string;
  sort_order: number;
  estimated_minutes: number | null;
}

export interface LessonProgressTable {
  id: string;
  user_id: string;
  lesson_id: string;
  status: string;
  time_spent: number;
  score: number | null;
}

export interface ApplicationTable {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  program: string;
  learning_mode: string;
  phone: string;
  date_of_birth: string | null;
  qualification: string;
  institution: string;
  completion_year: string;
  experience: string | null;
  created_at: string;
}

export interface NewsletterTable {
  email: string;
  created_at: string;
}

export interface Database {
  profiles: ProfileTable;
  sessions: SessionTable;
  courses: CourseTable;
  enrollments: EnrollmentTable;
  modules: ModuleTable;
  lessons: LessonTable;
  lesson_progress: LessonProgressTable;
  applications: ApplicationTable;
  newsletter_subscriptions: NewsletterTable;
}

export const db = new Kysely<Database>({
  dialect: new SqliteDialect({ database: database as never }),
});

export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, full_name TEXT,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student',
      status TEXT NOT NULL DEFAULT 'active', age_group TEXT, avatar_url TEXT,
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, thumbnail_url TEXT,
      teacher_id TEXT NOT NULL REFERENCES profiles(id), category_id TEXT,
      difficulty TEXT NOT NULL DEFAULT 'beginner', estimated_minutes INTEGER,
      status TEXT NOT NULL DEFAULT 'draft', subject TEXT, grade_level TEXT,
      deleted_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES profiles(id),
      course_id TEXT NOT NULL REFERENCES courses(id), progress REAL NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id)
    );
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, description TEXT, sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY, module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, estimated_minutes INTEGER
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES profiles(id),
      lesson_id TEXT NOT NULL REFERENCES lessons(id), status TEXT NOT NULL DEFAULT 'not_started',
      time_spent INTEGER NOT NULL DEFAULT 0, score REAL,
      UNIQUE(user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES profiles(id),
      full_name TEXT NOT NULL, email TEXT NOT NULL,
      program TEXT NOT NULL, learning_mode TEXT NOT NULL, phone TEXT NOT NULL,
      date_of_birth TEXT, qualification TEXT NOT NULL, institution TEXT NOT NULL,
      completion_year TEXT NOT NULL, experience TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      email TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn("profiles", "metadata", "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn("courses", "subject", "TEXT");
  ensureColumn("courses", "grade_level", "TEXT");
  ensureColumn("courses", "deleted_at", "TEXT");
  ensureColumn("enrollments", "archived", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("applications", "full_name", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("applications", "email", "TEXT NOT NULL DEFAULT ''");
}

function ensureColumn(table: string, column: string, definition: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((item) => item.name === column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
