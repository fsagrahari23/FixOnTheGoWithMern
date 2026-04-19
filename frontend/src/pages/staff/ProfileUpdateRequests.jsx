import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { CheckCircle, XCircle, FileCheck2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default function ProfileUpdateRequests() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requests, setRequests] = useState([])
  const [actionKey, setActionKey] = useState('')

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/staff/certifications/pending`, {
        credentials: 'include',
      })
      if (!response.ok) {
        let message = 'Failed to fetch profile update requests'
        try {
          const body = await response.json()
          message = body?.message || body?.error || message
        } catch (_) {
          // keep default
        }
        throw new Error(message)
      }
      const data = await response.json()
      setRequests(data.requests || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (mechanicId, certificationIndex, action) => {
    const key = `${mechanicId}-${certificationIndex}-${action}`
    setActionKey(key)
    try {
      const response = await fetch(
        `${API_BASE}/staff/mechanic/${mechanicId}/certification/${certificationIndex}/${action}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        let message = `Failed to ${action} request`
        try {
          const body = await response.json()
          message = body?.message || message
        } catch (_) {
          // keep default
        }
        throw new Error(message)
      }

      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`)
      fetchPendingRequests()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionKey('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/staff/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile Update Requests</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-8 mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <FileCheck2 className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Profile Update Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">Certification verification requests from mechanics</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Certification Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mechanic</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const cert = request.certification || {}
                  return (
                    <TableRow key={`${request.mechanicId}-${request.certificationIndex}`}>
                      <TableCell className="font-medium">{request.mechanicName || 'N/A'}</TableCell>
                      <TableCell>{request.mechanicEmail || 'N/A'}</TableCell>
                      <TableCell>{cert.name || '-'}</TableCell>
                      <TableCell>{cert.issuer || '-'}</TableCell>
                      <TableCell>{cert.year || '-'}</TableCell>
                      <TableCell>
                        {cert.imageUrl ? (
                          <a
                            href={cert.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 underline"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No image</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cert.verificationStatus || 'pending'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(request.mechanicId, request.certificationIndex, 'approve')}
                            disabled={actionKey === `${request.mechanicId}-${request.certificationIndex}-approve`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(request.mechanicId, request.certificationIndex, 'reject')}
                            disabled={actionKey === `${request.mechanicId}-${request.certificationIndex}-reject`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No pending profile update requests.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4">
        <Link to="/staff/mechanics">
          <Button variant="outline">Back to Mechanic Applications</Button>
        </Link>
      </div>
    </div>
  )
}
