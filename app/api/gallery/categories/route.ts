import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEdit, canAdmin } from '@/lib/gallery/services/authorization';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
} from '@/lib/gallery/services/categories';
import { categoryInputSchema } from '@/lib/gallery/validation';
import { invalidateCategories } from '@/lib/gallery/services/cache';
import { logActivity } from '@/lib/db/queries';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const category = await getCategoryById(Number(id));
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json(category);
    }

    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('[CATEGORIES GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const body = await request.json();
    const parsed = categoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const category = await createCategory(parsed.data);
    invalidateCategories();
    await logActivity('category', `Created category "${category.name}"`, user.name || user.email);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('[CATEGORIES POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const body = await request.json();
    const { id, active, ...updates } = body;

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const categoryId = Number(id);

    if (active !== undefined) {
      const category = active
        ? await activateCategory(categoryId)
        : await deactivateCategory(categoryId);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      invalidateCategories();
      await logActivity('category', `${active ? 'Activated' : 'Deactivated'} category "${category.name}"`, user.name || user.email);
      return NextResponse.json(category);
    }

    const parsed = categoryInputSchema.partial().safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const category = await updateCategory(categoryId, parsed.data);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    invalidateCategories();
    await logActivity('category', `Updated category "${category.name}"`, user.name || user.email);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('[CATEGORIES PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
