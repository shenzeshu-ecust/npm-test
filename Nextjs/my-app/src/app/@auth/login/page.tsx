'use client'

import  Modal  from '../../components/modal'
import { useRouter } from 'next/navigation'

export default function Login() {
    const router = useRouter()
  return (
    <Modal>
      <span onClick={() => router.back()}>Close modal</span>
      <h1>Login</h1>
    </Modal>
  )
}