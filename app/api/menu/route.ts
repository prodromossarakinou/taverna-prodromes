import { NextResponse } from 'next/server';
import { menuRepository } from '@/lib/repositories/mock';

export async function GET() {
  try {
    const menuItems = await menuRepository.getMenuItems();
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}
