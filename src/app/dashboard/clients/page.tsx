"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { bookingRequestService } from '@/lib/firebase/services'
import { BookingRequest } from '@/types/firebase'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  totalRequests: number
  completedRequests: number
  totalSpent: number
  lastRequest: string
  notes: string
  requests: BookingRequest[]
}

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchClients = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const bookingRequests = await bookingRequestService.getBookingRequests(user.uid)
      
      // Group booking requests by client (email)
      const clientMap = new Map<string, Client>()
      
      bookingRequests.forEach((request) => {
        const clientKey = request.clientEmail.toLowerCase()
        
        if (!clientMap.has(clientKey)) {
          clientMap.set(clientKey, {
            id: clientKey,
            name: request.clientName,
            email: request.clientEmail,
            phone: request.clientPhone,
            totalRequests: 0,
            completedRequests: 0,
            totalSpent: 0,
            lastRequest: request.createdAt.toString(),
            notes: request.notes || '',
            requests: []
          })
        }
        
        const client = clientMap.get(clientKey)!
        client.totalRequests++
        client.requests.push(request)
        
        // Update last request date
        const requestDate = new Date(request.createdAt)
        const lastRequestDate = new Date(client.lastRequest)
        if (requestDate > lastRequestDate) {
          client.lastRequest = request.createdAt.toString()
        }
        
        // Count completed requests (booked status)
        if (request.status === 'booked') {
          client.completedRequests++
          // Estimate spending (this would be more accurate with actual pricing)
          client.totalSpent += 75 // Default estimate
        }
      })
      
      setClients(Array.from(clientMap.values()))
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user, fetchClients])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Clients</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage your client list, including appointment history and spending
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => {/* TODO: Implement client messaging */}}
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              Message Clients
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name, email, or phone..."
              className="block w-full rounded-md border-0 py-1.5 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-accent-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Clients List */}
          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Clients will appear here once they submit booking requests.'}
                </p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <motion.div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full rounded-lg border p-4 text-left transition-all cursor-pointer ${
                    selectedClient?.id === client.id
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gray-200 bg-white hover:border-accent-300'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate">
                          {client.name}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{client.completedRequests} completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>${client.totalSpent}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-sm text-gray-700">
                        Last request: {formatDate(client.lastRequest)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Client Details */}
          <div className="rounded-lg bg-white p-4 sm:p-6 shadow">
            <h2 className="text-lg font-medium text-gray-900">Client Details</h2>
            {selectedClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900">{selectedClient.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a href={`mailto:${selectedClient.email}`} className="text-accent-600 hover:text-accent-500 truncate">
                          {selectedClient.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a href={`tel:${selectedClient.phone}`} className="text-accent-600 hover:text-accent-500">
                          {selectedClient.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Booking History</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900">
                          {selectedClient.completedRequests} of {selectedClient.totalRequests} requests completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900">Estimated total spent: ${selectedClient.totalSpent}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900">Last request: {formatDate(selectedClient.lastRequest)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedClient.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Latest Notes</h3>
                      <div className="mt-2 flex items-start gap-2 text-sm">
                        <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-900">{selectedClient.notes}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Recent Requests</h3>
                    <div className="mt-2 space-y-2">
                      {selectedClient.requests.slice(0, 3).map((request, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="font-medium">{request.service}</div>
                          <div className="text-gray-600">
                            {request.stylistPreference} • {formatDate(request.createdAt.toString())}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            Status: {request.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="mt-4 text-center text-gray-500">
                <UserIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm">Select a client to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 