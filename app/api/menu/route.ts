import { NextResponse } from 'next/server';
import { menuRepository } from '@/lib/repositories';

export async function GET() {
  try {
    const menuItems = await menuRepository.getMenuItems();
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Invalid menu payload' }, { status: 400 });
    }

    const created = await menuRepository.createMenuItem({
      name: body.name,
      category: body.category,
      price: body.price ?? null,
      extraNotes: body.extraNotes ?? null,
      active: body.active ?? true,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
