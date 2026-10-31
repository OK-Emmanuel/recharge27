import HotSeatsList from "@/components/portal/hot-seats-list"

export default function HotSeatsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">2026 Hot Seats</h1>
      <p className="text-muted-foreground mb-8">Review challenges from the previous edition and manage selections.</p>
      <HotSeatsList isAdmin />
    </div>
  )
}
