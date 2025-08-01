'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSearchParams } from 'next/navigation'
import { providerService, salonService } from '@/lib/firebase/services'
import { Provider, Salon } from '@/types/firebase'

// Mock data for the prototype
const lastMinuteSlots = [
  {
    id: 1,
    date: 'Today',
    time: '2:00 PM',
    service: 'Haircut',
    duration: '30 min',
    originalPrice: 35,
    discountPrice: 25,
    expiresIn: '2 hours',
  },
  {
    id: 2,
    date: 'Today',
    time: '4:30 PM',
    service: 'Hair Color',
    duration: '2 hours',
    originalPrice: 120,
    discountPrice: 85,
    expiresIn: '4 hours',
  },
  {
    id: 3,
    date: 'Tomorrow',
    time: '11:00 AM',
    service: 'Highlights',
    duration: '2.5 hours',
    originalPrice: 150,
    discountPrice: 110,
    expiresIn: '1 day',
  },
]

// Booking form schema
const bookingSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  notes: yup.string().optional().default(''),
})

type BookingFormData = yup.InferType<typeof bookingSchema>

function BookingForm() {
  const [selectedSlot, setSelectedSlot] = useState<typeof lastMinuteSlots[0] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [salon, setSalon] = useState<Salon | null>(null)
  const [isProviderSubmission, setIsProviderSubmission] = useState(false)
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: yupResolver(bookingSchema),
  })

  // Check for provider parameter and fetch provider data
  useEffect(() => {
    const providerId = searchParams.get('provider')
    if (providerId) {
      setIsProviderSubmission(true)
      fetchProviderData(providerId)
    }
  }, [searchParams])

  const fetchProviderData = async (providerId: string) => {
    try {
      const providerData = await providerService.getProvider(providerId)
      if (providerData) {
        setProvider(providerData)
        // Fetch salon data to get salon name
        const salonData = await salonService.getSalon(providerData.salonId)
        setSalon(salonData)
      }
    } catch (error) {
      console.error('Error fetching provider data:', error)
      // Fall back to regular booking form if provider doesn't exist
      setIsProviderSubmission(false)
    }
  }

  const handleBookingSubmit = async (data: BookingFormData) => {
    if (!selectedSlot) return

    // Manual validation for provider submissions
    if (!isProviderSubmission && (!data.email || !data.phone)) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would make an API call
      console.log('Booking request:', {
        ...data,
        slot: selectedSlot,
        submittedByProvider: isProviderSubmission,
        providerId: provider?.id,
        providerName: provider?.name,
      })
      
      // Reset form and selection
      reset()
      setSelectedSlot(null)
      
      // Show success message (in a real app)
      alert('Booking request submitted successfully!')
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('Failed to submit booking request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Last-Minute Appointments
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Grab these discounted slots before they&apos;re gone!
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Available Slots */}
            <div className="space-y-4">
              {lastMinuteSlots.map((slot) => (
                <motion.button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    selectedSlot?.id === slot.id
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gray-200 bg-white hover:border-accent-300'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-accent-600" />
                        <span className="font-medium text-gray-900">
                          {slot.date} at {slot.time}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {slot.service} • {slot.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">
                          ${slot.originalPrice}
                        </span>
                        <span className="text-lg font-semibold text-accent-600">
                          ${slot.discountPrice}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-accent-600">
                        <SparklesIcon className="h-4 w-4" />
                        <span>Expires in {slot.expiresIn}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Booking Form */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">Book Your Slot</h2>
              {isProviderSubmission && provider && salon && (
                <div className="mt-2 text-sm text-gray-600">
                  <div className="font-medium">{salon.name}</div>
                  <div>Provider: {provider.name}</div>
                </div>
              )}
              {selectedSlot ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mt-4 rounded-md bg-accent-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-accent-900">
                          {selectedSlot.service}
                        </div>
                        <div className="mt-1 text-sm text-accent-700">
                          {selectedSlot.date} at {selectedSlot.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-accent-900">
                          <span className="line-through">${selectedSlot.originalPrice}</span>
                          <span className="ml-2 text-lg font-semibold">${selectedSlot.discountPrice}</span>
                        </div>
                        <div className="mt-1 text-xs text-accent-600">
                          Expires in {selectedSlot.expiresIn}
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(handleBookingSubmit)} className="mt-6 space-y-4">
                    <div>
                      <Input
                        label={isProviderSubmission ? "Client Name" : "Full Name"}
                        icon={UserIcon}
                        error={errors.name?.message}
                        {...register('name')}
                      />
                    </div>

                    {!isProviderSubmission && (
                      <>
                        <div>
                          <Input
                            type="email"
                            label="Email"
                            icon={EnvelopeIcon}
                            error={errors.email?.message}
                            {...register('email')}
                          />
                        </div>

                        <div>
                          <Input
                            type="tel"
                            label="Phone Number"
                            icon={PhoneIcon}
                            error={errors.phone?.message}
                            {...register('phone')}
                          />
                        </div>
                      </>
                    )}
                    {isProviderSubmission && (
                      <>
                        <div>
                          <Input
                            type="email"
                            label="Client Email (Optional)"
                            icon={EnvelopeIcon}
                            {...register('email')}
                          />
                        </div>

                        <div>
                          <Input
                            type="tel"
                            label="Client Phone (Optional)"
                            icon={PhoneIcon}
                            {...register('phone')}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Notes
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                        placeholder="Any special requests or requirements?"
                      />
                    </div>

                    <div className="mt-6">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                      >
                        Book Now - ${selectedSlot.discountPrice}
                      </Button>
                      <p className="mt-2 text-center text-xs text-gray-500">
                        You&apos;ll receive a confirmation email once the service provider approves your request
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <div className="mt-6 text-center text-gray-500">
                  Select an available slot to book your appointment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking form...</p>
        </div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
} 