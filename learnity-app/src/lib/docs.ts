import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocMetadata {
  title: string;
  description?: string;
  date?: string;
  category?: string;
  tags?: string[];
}

export interface Doc {
  slug: string;
  metadata: DocMetadata;
  content: string;
}

export interface DocWithHtml extends Doc {
  htmlContent: string;
}

/**
 * Get all documentation files
 */
export function getAllDocs(): Doc[] {
  const fileNames = fs.readdirSync(docsDirectory);

  const allDocs = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);

      // Extract title from content if not in frontmatter
      let title = data.title || slug.replace(/_/g, ' ').replace(/-/g, ' ');

      // Try to get title from first heading in markdown
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch && !data.title) {
        title = titleMatch[1];
      }

      return {
        slug,
        metadata: {
          title,
          description: data.description || extractDescription(content),
          date: data.date,
          category: data.category || categorizeDoc(slug),
          tags: data.tags || [],
        },
        content,
      };
    });

  // Sort by title
  return allDocs.sort((a, b) =>
    a.metadata.title.localeCompare(b.metadata.title)
  );
}

/**
 * Get a single documentation file by slug
 */
export async function getDocBySlug(slug: string): Promise<DocWithHtml | null> {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);

    // Extract title from content if not in frontmatter
    let title = data.title || slug.replace(/_/g, ' ').replace(/-/g, ' ');

    // Try to get title from first heading in markdown
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && !data.title) {
      title = titleMatch[1];
    }

    // Convert markdown to HTML
    const processedContent = await remark().use(gfm).use(html).process(content);

    const htmlContent = processedContent.toString();

    return {
      slug,
      metadata: {
        title,
        description: data.description || extractDescription(content),
        date: data.date,
        category: data.category || categorizeDoc(slug),
        tags: data.tags || [],
      },
      content,
      htmlContent,
    };
  } catch (error) {
    console.error(`Error loading doc ${slug}:`, error);
    return null;
  }
}

/**
 * Get all documentation slugs for static generation
 */
export function getAllDocSlugs(): string[] {
  const fileNames = fs.readdirSync(docsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}

/**
 * Extract description from markdown content
 */
function extractDescription(content: string): string {
  // Remove markdown headings
  const withoutHeadings = content.replace(/^#+\s+.+$/gm, '');

  // Get first paragraph
  const firstParagraph = withoutHeadings
    .trim()
    .split('\n\n')[0]
    .replace(/\n/g, ' ')
    .trim();

  // Limit to 160 characters
  return firstParagraph.length > 160
    ? firstParagraph.substring(0, 157) + '...'
    : firstParagraph;
}

/**
 * Categorize documentation based on filename
 */
function categorizeDoc(slug: string): string {
  const lowerSlug = slug.toLowerCase();

  if (lowerSlug.includes('admin')) return 'Admin';
  if (lowerSlug.includes('teacher')) return 'Teachers';
  if (lowerSlug.includes('student')) return 'Students';
  if (
    lowerSlug.includes('auth') ||
    lowerSlug.includes('registration') ||
    lowerSlug.includes('login')
  )
    return 'Authentication';
  if (lowerSlug.includes('firebase')) return 'Infrastructure';
  if (lowerSlug.includes('loading')) return 'UI/UX';
  if (lowerSlug.includes('certificate')) return 'Features';
  if (lowerSlug.includes('seo')) return 'SEO';
  if (lowerSlug.includes('setup') || lowerSlug.includes('infrastructure'))
    return 'Setup';
  if (lowerSlug.includes('guide') || lowerSlug.includes('how')) return 'Guides';
  if (lowerSlug.includes('plan') || lowerSlug.includes('execution'))
    return 'Planning';

  return 'General';
}

/**
 * Get documentation grouped by category
 */
export function getDocsByCategory(): Record<string, Doc[]> {
  const allDocs = getAllDocs();
  const grouped: Record<string, Doc[]> = {};

  allDocs.forEach(doc => {
    const category = doc.metadata.category || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(doc);
  });

  return grouped;
}
