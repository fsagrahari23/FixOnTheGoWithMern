import { useState } from "react"
import { Search, Mail, User, Phone, CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { apiGet } from "../../../lib/api"

function StatusBadge({ status }) {
  const base = "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
  const map = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-cyan-100 text-cyan-700",
    "in-progress": "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  }
  return <span className={`${base} ${map[status] || "bg-gray-100 text-gray-700"}`}>{status || "unknown"}</span>
}

export function UserBookingSearch() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState([])

  const searchUsers = async () => {
    const q = query.trim()
    if (!q) {
      setError("Please enter a user name or email")
      setResults([])
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await apiGet(`/mechanic/api/bookings/search-user?q=${encodeURIComponent(q)}`)
      setResults(response?.users || [])
    } catch (err) {
      let message = "Failed to search users"
      if (err?.body) {
        try {
          const parsed = JSON.parse(err.body)
          if (parsed?.message) message = parsed.message
        } catch {
          // keep fallback message
        }
      }
      setError(message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      searchUsers()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search User Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by user name or email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Search className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {!loading && !error && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No user results yet. Start by searching name or email.</p>
        ) : null}

        <div className="space-y-5">
          {results.map((user) => (
            <div key={user._id} className="rounded-xl border border-border bg-card/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  <User className="h-3.5 w-3.5" />
                  {user.name}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                {user.phone ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    <Phone className="h-3.5 w-3.5" />
                    {user.phone}
                  </span>
                ) : null}
                <span className="ml-auto text-xs font-semibold text-muted-foreground">{user.bookingCount || 0} bookings</span>
              </div>

              {user.bookings?.length ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Booking ID</th>
                        <th className="px-3 py-2 font-medium">Problem</th>
                        <th className="px-3 py-2 font-medium">Description</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Payment</th>
                        <th className="px-3 py-2 font-medium">Mechanic</th>
                        <th className="px-3 py-2 font-medium">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.bookings.map((booking) => (
                        <tr key={booking._id} className="border-t border-border align-top">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">{booking._id}</td>
                          <td className="px-3 py-2">{booking.problemCategory || "-"}</td>
                          <td className="px-3 py-2 max-w-[220px] wrap-break-word">{booking.description || "-"}</td>
                          <td className="px-3 py-2"><StatusBadge status={booking.status} /></td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="font-medium">Rs {booking.payment?.amount?.toLocaleString?.() || 0}</div>
                            <div className="text-xs text-muted-foreground">{booking.payment?.status || "pending"}</div>
                          </td>
                          <td className="px-3 py-2">
                            {booking.mechanic ? (
                              <div>
                                <div className="font-medium">{booking.mechanic.name}</div>
                                <div className="text-xs text-muted-foreground">{booking.mechanic.email}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not assigned</span>
                            )}
                          </td>
                          <td className="px-3 py-2 max-w-[260px] wrap-break-word">{booking.location?.address || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No bookings found for this user.</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
