"use client"

import { useState, useEffect } from "react"
import { Users, Clock, Check, X, MessageSquare } from "lucide-react"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import EmptyState from "../../components/ui/EmptyState"
import Modal from "../../components/ui/Modal"
import { trainerRequestService } from "../../services/trainerRequest"
import { formatDate } from "../../utils/helpers"

const TrainerRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseAction, setResponseAction] = useState(null) // 'approve' or 'reject'
  const [responseMessage, setResponseMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await trainerRequestService.getPendingRequests()
      setRequests(data)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenResponse = (request, action) => {
    setSelectedRequest(request)
    setResponseAction(action)
    setResponseMessage("")
    setShowResponseModal(true)
  }

  const handleSubmitResponse = async () => {
    if (!selectedRequest) return

    setSubmitting(true)
    try {
      if (responseAction === "approve") {
        await trainerRequestService.approveRequest(selectedRequest._id, responseMessage)
      } else {
        await trainerRequestService.rejectRequest(selectedRequest._id, responseMessage)
      }

      setShowResponseModal(false)
      setSelectedRequest(null)
      setResponseMessage("")
      fetchRequests()
    } catch (error) {
      console.error(`Failed to ${responseAction} request:`, error)
      alert(error.response?.data?.message || `Failed to ${responseAction} request`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Client Requests</h1>
        <p className="text-muted">Review and manage pending trainer requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Pending Requests</p>
            <p className="text-2xl font-bold text-primary">{requests.length}</p>
          </div>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <Card.Header>
          <Card.Title>Pending Requests</Card.Title>
        </Card.Header>
        <Card.Content>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="p-4 border border-border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {request.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-primary">{request.user?.name}</h3>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        <p className="text-sm text-muted mb-2">{request.user?.email}</p>
                        
                        {request.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare size={16} className="text-muted mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-primary italic">"{request.message}"</p>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted mt-2">
                          Requested {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenResponse(request, "reject")}
                      >
                        <X size={16} className="mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenResponse(request, "approve")}
                      >
                        <Check size={16} className="mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No pending requests"
              description="You don't have any pending client requests at the moment"
            />
          )}
        </Card.Content>
      </Card>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={responseAction === "approve" ? "Approve Request" : "Reject Request"}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted mb-1">Client</p>
            <p className="font-semibold text-primary">{selectedRequest?.user?.name}</p>
            <p className="text-sm text-muted">{selectedRequest?.user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Response Message (Optional)
            </label>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={
                responseAction === "approve"
                  ? "Welcome message or next steps..."
                  : "Reason for rejection or alternative suggestions..."
              }
              className="w-full px-4 py-2 border border-border rounded-lg resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted mt-1">{responseMessage.length}/500</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowResponseModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              loading={submitting}
              variant={responseAction === "approve" ? "default" : "outline"}
            >
              {responseAction === "approve" ? "Approve & Assign" : "Reject Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TrainerRequests
