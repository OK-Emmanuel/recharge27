"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface HotSeatsListProps {
  isAdmin: boolean
}

interface HotSeat {
  id: string
  userName: string
  challenge: string
  context: string
  helpWanted: string
  selected: boolean
  timestamp: string
}

export default function HotSeatsList({ isAdmin }: HotSeatsListProps) {
  const [hotSeats, setHotSeats] = useState<HotSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHotSeats()
    
    const handleUpdate = () => fetchHotSeats()
    window.addEventListener("hotSeatsUpdated", handleUpdate)
    
    return () => window.removeEventListener("hotSeatsUpdated", handleUpdate)
  }, [])

  const fetchHotSeats = async () => {
    setError(null)
    try {
      const res = await fetch("/api/portal/hot-seats")
      if (res.ok) {
        const data = await res.json()
        setHotSeats(data.hotSeats)
      } else throw new Error(`Failed to load hot seats (${res.status})`)
    } catch (error) {
      console.error("Failed to fetch hot seats:", error)
      setError("Unable to load hot seats. Please retry.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelect = async (hotSeatId: string) => {
    try {
      const res = await fetch("/api/portal/hot-seats/toggle-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotSeatId }),
      })

      if (res.ok) {
        fetchHotSeats()
      } else throw new Error(`Failed to update selection (${res.status})`)
    } catch (error) {
      console.error("Failed to toggle selection:", error)
      setError("Unable to change this selection. Please retry.")
    }
  }

  if (loading) {
    return (
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardContent className="py-8 text-center text-gray-400">
          Loading submissions...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && <div role="alert" className="text-danger">{error} <Button variant="outline" onClick={fetchHotSeats}>Retry</Button></div>}
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-white">Hot Seat Submissions</CardTitle>
        </CardHeader>
      </Card>

      {error && hotSeats.length === 0 ? null : hotSeats.length === 0 ? (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="py-8 text-center text-gray-400">
            No submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {hotSeats.map((hs) => (
            <Card 
              key={hs.id} 
              className={`bg-[var(--card)] ${hs.selected ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{hs.userName}</span>
                    {hs.selected && (
                      <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--accent)]">Challenge:</h4>
                    <p className="text-white text-sm mt-1">{hs.challenge}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--accent)]">Context:</h4>
                    <p className="text-gray-300 text-sm mt-1">{hs.context}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--accent)]">Help Wanted:</h4>
                    <p className="text-gray-300 text-sm mt-1">{hs.helpWanted}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[var(--border)]">
                  <span>{new Date(hs.timestamp).toLocaleString()}</span>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant={hs.selected ? "outline" : "default"}
                      onClick={() => handleToggleSelect(hs.id)}
                      className="text-xs"
                    >
                      {hs.selected ? "Unselect" : "Select for Hot Seat"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
