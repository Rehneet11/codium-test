import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, setLogger } from 'react-query'
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest'

import {
  useGetMyRestaurant,
  useCreateMyRestaurant,
  useUpdateMyRestaurant,
  useGetMyOrdersForRestaurant,
  useUpdateMyRestaurantOrder,
} from '@/api/MyRestaurantApi'

// Mock Auth0 hook to provide a token
vi.mock('@auth0/auth0-react', () => {
  const getAccessTokenSilently = vi.fn().mockResolvedValue('test-access-token')
  return {
    useAuth0: () => ({ getAccessTokenSilently }),
    // re-export the mock so tests can tweak if needed
    getAccessTokenSilently,
  }
})

// Mock toast notifications from 'sonner'
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Access mocked toast for assertions
import { toast } from 'sonner'

// Utility: create a fresh QueryClient per test to avoid cache bleed
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  // Silence react-query errors in test output
  setLogger({
    log: console.log,
    warn: console.warn,
    error: () => {},
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeAll(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://api.test')
})

beforeEach(() => {
  vi.clearAllMocks()
})

declare global {
  // Extend global with fetch typing for TS
  // eslint-disable-next-line no-var
  var fetch: typeof globalThis.fetch
}

// Helper to set fetch mock response
const mockFetch = (response: Partial<Response> & { json?: () => any }) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
    ...response,
  } as Response) as any
}

// Tests

describe('MyRestaurantApi hooks', () => {
  describe('useGetMyRestaurant', () => {
    it('should fetch my restaurant successfully with auth header', async () => {
      const restaurant = { id: 'r1', name: 'Testaurant' }
      mockFetch({ ok: true, json: async () => restaurant })

      const { result } = renderHook(() => useGetMyRestaurant(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.restaurant).toEqual(restaurant)

      // Verify fetch call and headers
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url, init] = (global.fetch as any).mock.calls[0]
      expect(url).toBe('http://api.test/api/my/restaurant')
      expect(init.method).toBe('GET')
      expect(init.headers.Authorization).toBe('Bearer test-access-token')
    })

    it('should handle error response (restaurant undefined)', async () => {
      mockFetch({ ok: false })

      const { result } = renderHook(() => useGetMyRestaurant(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.restaurant).toBeUndefined()
    })
  })

  describe('useCreateMyRestaurant', () => {
    it('should POST form data and show success toast', async () => {
      const created = { id: 'r2', name: 'New Resto' }
      mockFetch({ ok: true, json: async () => created })

      const { result } = renderHook(() => useCreateMyRestaurant(), {
        wrapper: createWrapper(),
      })

      const fd = new FormData()
      fd.append('name', 'New Resto')

      await act(async () => {
        // mutate is sync to call, but completes async; we wait on toast
        result.current.createRestaurant(fd)
      })

      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Restaurant created!'))

      // Assert fetch called with correct method, headers and body
      const [url, init] = (global.fetch as any).mock.calls[0]
      expect(url).toBe('http://api.test/api/my/restaurant')
      expect(init.method).toBe('POST')
      expect(init.headers.Authorization).toBe('Bearer test-access-token')
      expect(init.body).toBe(fd)
    })

    it('should show error toast when creation fails', async () => {
      mockFetch({ ok: false })

      const { result } = renderHook(() => useCreateMyRestaurant(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const fd = new FormData()
        result.current.createRestaurant(fd)
      })

      // Note: current implementation shows an "update" error message for create
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Unable to update restaurant'))
    })
  })

  describe('useUpdateMyRestaurant', () => {
    it('should PUT form data and show success toast', async () => {
      const updated = { id: 'r1', name: 'Updated' }
      mockFetch({ ok: true, json: async () => updated })

      const { result } = renderHook(() => useUpdateMyRestaurant(), {
        wrapper: createWrapper(),
      })

      const fd = new FormData()
      fd.append('name', 'Updated')

      await act(async () => {
        result.current.updateRestaurant(fd)
      })

      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Restaurant Updated'))

      const [url, init] = (global.fetch as any).mock.calls[0]
      expect(url).toBe('http://api.test/api/my/restaurant')
      expect(init.method).toBe('PUT')
      expect(init.headers.Authorization).toBe('Bearer test-access-token')
      expect(init.body).toBe(fd)
    })

    it('should show error toast when update fails', async () => {
      mockFetch({ ok: false })

      const { result } = renderHook(() => useUpdateMyRestaurant(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.updateRestaurant(new FormData())
      })

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Unable to update Restaurant'))
    })
  })

  describe('useGetMyOrdersForRestaurant', () => {
    it('should fetch orders with correct headers', async () => {
      const orders = [
        { id: 'o1', status: 'placed' },
        { id: 'o2', status: 'paid' },
      ]
      mockFetch({ ok: true, json: async () => orders })

      const { result } = renderHook(() => useGetMyOrdersForRestaurant(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.orders).toEqual(orders as any)

      const [url, init] = (global.fetch as any).mock.calls[0]
      expect(url).toBe('http://api.test/api/my/restaurant/order')
      expect(init.headers.Authorization).toBe('Bearer test-access-token')
      expect(init.headers['Content-Type']).toBe('application/json')
    })

    it('should handle error response (orders undefined)', async () => {
      mockFetch({ ok: false })

      const { result } = renderHook(() => useGetMyOrdersForRestaurant(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.orders).toBeUndefined()
    })
  })

  describe('useUpdateMyRestaurantOrder', () => {
    it('should update status and show success toast', async () => {
      const payload = { orderId: 'o1', status: 'paid' }
      mockFetch({ ok: true, json: async () => ({ success: true }) })

      const { result } = renderHook(() => useUpdateMyRestaurantOrder(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.updateRestaurantStatus(payload)
      })

      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Order updated'))

      const [url, init] = (global.fetch as any).mock.calls[0]
      expect(url).toBe(`http://api.test/api/my/restaurant/order/${payload.orderId}/status`)
      expect(init.method).toBe('PUT')
      expect(init.headers.Authorization).toBe('Bearer test-access-token')
      expect(init.headers['Content-Type']).toBe('application/json')
      expect(init.body).toBe(JSON.stringify({ status: payload.status }))
    })

    it('should show error toast and handle failure', async () => {
      mockFetch({ ok: false })

      const { result } = renderHook(() => useUpdateMyRestaurantOrder(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await expect(
          result.current.updateRestaurantStatus({ orderId: 'o1', status: 'cancelled' })
        ).rejects.toThrow()
      })

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Unable to update order'))
    })
  })
})
