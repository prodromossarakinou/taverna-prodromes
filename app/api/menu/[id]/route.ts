import { NextResponse } from 'next/server';
import { menuRepository } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Invalid menu payload' }, { status: 400 });
    }

    const updated = await menuRepository.updateMenuItem(id, {
      name: body.name,
      category: body.category,
      price: body.price ?? null,
      extraNotes: body.extraNotes ?? null,
      active: body.active ?? true,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await menuRepository.deleteMenuItem(id);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}