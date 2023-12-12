'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Links() {
    const pathname = usePathname()
    return (
      <nav>
        <ul>
          <li>
            <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/">
              Home
            </Link>
          </li>
          <li>
            <Link
              className={`link ${pathname === '/dashboard' ? 'active' : ''}`}
              href="/dashboard"
            >
              dashboard
            </Link>
          </li>
        </ul>
      </nav>
    )
}