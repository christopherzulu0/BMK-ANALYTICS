import { requireAuth } from "@/lib/auth"
import SplitView from "./SplitView"

// This is a Server Component — handles auth on the server, then renders the client view
export default async function SplitPage() {
  await requireAuth("dispatcher");

  return <SplitView />
}
