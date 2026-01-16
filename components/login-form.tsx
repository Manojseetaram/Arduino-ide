"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ email, password })
    // Navigate to dashboard page after login
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-gray-500">
          Enter your email and password
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          required
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          required
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-black py-2 text-white hover:opacity-90"
      >
        Sign In
      </button>
    </form>
  )
}
