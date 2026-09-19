import { prisma } from '@/lib/db';

const DEFAULT_SKILLS = [
  { name: 'Logic & Reasoning', description: 'Critical thinking and problem-solving abilities', category: 'cognitive', icon: '🧠', color: '#8b5cf6' },
  { name: 'Mathematical Thinking', description: 'Numerical reasoning and calculation skills', category: 'cognitive', icon: '🔢', color: '#3b82f6' },
  { name: 'Reading Comprehension', description: 'Understanding and analyzing text', category: 'language', icon: '📖', color: '#10b981' },
  { name: 'Writing Skills', description: 'Expressing ideas clearly in written form', category: 'language', icon: '✍️', color: '#f59e0b' },
  { name: 'Scientific Method', description: 'Observation, hypothesis, experimentation', category: 'science', icon: '🔬', color: '#06b6d4' },
  { name: 'Data Analysis', description: 'Interpreting charts, graphs, and statistics', category: 'science', icon: '📊', color: '#ef4444' },
  { name: 'Creative Thinking', description: 'Generating original ideas and solutions', category: 'creative', icon: '🎨', color: '#ec4899' },
  { name: 'Memory & Recall', description: 'Retaining and retrieving information', category: 'cognitive', icon: '💡', color: '#f97316' },
  { name: 'Pattern Recognition', description: 'Identifying trends and relationships', category: 'cognitive', icon: '🔍', color: '#14b8a6' },
  { name: 'Communication', description: 'Expressing ideas verbally and non-verbally', category: 'language', icon: '🗣️', color: '#6366f1' },
];

export async function seedDefaultSkills() {
  const existing = await prisma.skill.count();
  if (existing > 0) return { created: 0, skipped: existing };

  let created = 0;
  for (const skill of DEFAULT_SKILLS) {
    await prisma.skill.create({ data: skill });
    created++;
  }

  return { created, skipped: 0 };
}
