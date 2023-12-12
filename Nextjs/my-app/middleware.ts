import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  console.log('middleware');
  let cookie = request.cookies.get('nextjs')
  console.log(cookie);
  let allCookies = request.cookies.getAll()
  console.log(allCookies);

  request.cookies.has('nextjs')
  request.cookies.delete('nextjs')

  const response = NextResponse.next()
  response.cookies.set('vercel', 'fast')
  response.cookies.set({
    name: 'vercel',
    value: 'fast',
    path: '/'
  })
  
  
  
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url))
  }
 
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url))
  }
}