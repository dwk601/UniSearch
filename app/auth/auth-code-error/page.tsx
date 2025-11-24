import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">Authentication Error</h1>
      <p className="text-muted-foreground">
        There was an error verifying your authentication code. Please try signing in again.
      </p>
      <Link href="/login">
        <Button>Back to Login</Button>
      </Link>
    </div>
  )
}
