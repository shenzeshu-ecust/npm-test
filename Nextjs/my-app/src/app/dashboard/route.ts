import { type NextRequest } from 'next/server'
export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export async function GET(request: Request, {params}: {params:{slug: string}}) {
    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
}