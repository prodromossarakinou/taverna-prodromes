import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ParsedParams = {
  from?: Date
  to?: Date
  status?: 'open' | 'closed' | 'cancelled' | 'any'
  limit: number
}

function parseParams(url: string): ParsedParams {
  const u = new URL(url)
  const sp = u.searchParams
  const fromRaw = sp.get('from')
  const toRaw = sp.get('to')
  const statusRaw = (sp.get('status') ?? '').toLowerCase()
  const limitRaw = sp.get('limit')

  const from = fromRaw ? new Date(fromRaw) : undefined
  const to = toRaw ? new Date(toRaw) : undefined
  const status = (['open', 'closed', 'cancelled', 'any'] as const).includes(
    statusRaw as any,
  )
    ? (statusRaw as ParsedParams['status'])
    : undefined

  const limit = Math.max(1, Math.min(100, Number(limitRaw ?? 10) || 10))

  return { from, to, status, limit }
}

export async function GET(req: Request) {
  try {
    const { from, to, status, limit } = parseParams(req.url)

    const billWhere: any = {}

    if (status && status !== 'any') {
      billWhere.status = status
    } else {
      // default: εξαιρούμε ακυρωμένα
      billWhere.status = { not: 'cancelled' }
    }

    if (from || to) {
      billWhere.createdAt = {}
      if (from) billWhere.createdAt.gte = from
      if (to) billWhere.createdAt.lte = to
    }

    const grouped = await prisma.billItem.groupBy({
      by: ['menuItemId', 'name', 'category'],
      where: { bill: billWhere },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
    })

    const all = grouped.map((g) => ({
      key: g.menuItemId ?? g.name,
      menuItemId: g.menuItemId,
      name: g.name,
      category: g.category,
      times: g._sum.quantity ?? 0,
    }))

    const distinct = all.length
    const mostSelected = all[0] ?? null
    const top = all.slice(0, limit)
    const bottom = [...all]
      .filter((x) => x.times > 0)
      .slice(-limit)
      .reverse()

    return NextResponse.json({
      range: {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      },
      status: status ?? 'non-cancelled',
      distinct,
      totalItems: all.reduce((acc, x) => acc + x.times, 0),
      mostSelected,
      top,
      bottom,
    })
  } catch (error) {
    console.error('Error building menu report:', error)
    return NextResponse.json(
      { error: 'Failed to build menu report' },
      { status: 500 },
    )
  }
}
