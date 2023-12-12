import { cookies, headers } from 'next/headers'
import {type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'


export async function GET(request: Request) {

  const cookieStore = cookies()
  const token = cookieStore.get('token')

  const headersList = headers()
  const referer = headersList.get('referer')

  const { searchParams } = new URL(request.url)
  redirect('https://nextjs.org/')

  return new Response('Hello, nextjs', {
    status: 200,
    headers: {
      'Set-Cookie': `token=${token.value}`,
      referer,
    }
  })
  const id = searchParams.get('id')
  const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const product = await res.json()
 
  return Response.json({ product })
}

//  或者

// export async function GET(request :NextRequest) {
//   const token = request.cookies.get('token')
//   const requestHeaders = new Headers(request.headers)
// }