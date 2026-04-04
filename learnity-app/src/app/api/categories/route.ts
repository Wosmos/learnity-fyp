import { NextResponse } from 'next/server';
import { getCachedCategories } from '@/lib/cache/server-cache';

export async function GET() {
  try {
    const categories = await getCachedCategories();

    return NextResponse.json(
      categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
    );
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
