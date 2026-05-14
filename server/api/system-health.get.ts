type HealthState = 'online' | 'reachable' | 'degraded' | 'offline'

type ServiceCheck = {
  id: string
  name: string
  kind: 'backend' | 'worker' | 'storage' | 'media' | 'client'
  url: string | null
  description: string
  status: HealthState
  statusCode: number | null
  latencyMs: number | null
  checkedAt: string
  details: string
}

const withTimeout = async (input: string, timeoutMs = 8000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'kakofi-admin-system-health'
      }
    })

    return response
  } finally {
    clearTimeout(timer)
  }
}

const classifyResponse = (status: number): HealthState => {
  if (status >= 200 && status < 400) return 'online'
  if (status >= 400 && status < 500) return 'reachable'
  if (status >= 500) return 'degraded'
  return 'offline'
}

const checkHttpService = async (service: Omit<ServiceCheck, 'status' | 'statusCode' | 'latencyMs' | 'checkedAt' | 'details'>): Promise<ServiceCheck> => {
  const startedAt = Date.now()

  try {
    const response = await withTimeout(service.url!)
    const latencyMs = Date.now() - startedAt
    const status = classifyResponse(response.status)

    return {
      ...service,
      status,
      statusCode: response.status,
      latencyMs,
      checkedAt: new Date().toISOString(),
      details: status === 'online'
        ? 'Service responded successfully.'
        : status === 'reachable'
          ? 'Service is reachable but did not return a success response.'
          : 'Service responded with a server-side failure status.'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown network error'

    return {
      ...service,
      status: 'offline',
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      details: message
    }
  }
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const services: Array<Omit<ServiceCheck, 'status' | 'statusCode' | 'latencyMs' | 'checkedAt' | 'details'>> = [
    {
      id: 'supabase',
      name: 'Supabase backend',
      kind: 'backend',
      url: `${config.public.supabaseUrl}/auth/v1/health`,
      description: 'Database, auth, API, and realtime foundation.'
    },
    {
      id: 'stripe-worker',
      name: 'Stripe worker',
      kind: 'worker',
      url: 'https://stripe-worker.boyg87059.workers.dev/',
      description: 'Handles Stripe payment workflows.'
    },
    {
      id: 'local-payment-worker',
      name: 'Rwanda payment worker',
      kind: 'worker',
      url: 'https://kakofi-payment.boyg87059.workers.dev/',
      description: 'Handles local Rwandan payment workflows.'
    },
    {
      id: 'r2-uploader-worker',
      name: 'R2 uploader worker',
      kind: 'storage',
      url: 'https://r2-uploader.boyg87059.workers.dev/',
      description: 'Uploads and stores smaller files in R2.'
    },
    {
      id: 'mux',
      name: 'Mux media layer',
      kind: 'media',
      url: 'https://status.mux.com/api/v2/status.json',
      description: 'Large media delivery and processing provider.'
    }
  ]

  const checkedServices = await Promise.all(services.map(checkHttpService))

  const clientNodes: ServiceCheck[] = [
    {
      id: 'web-platform',
      name: 'Web platform',
      kind: 'client',
      url: null,
      description: 'Consumes Supabase, Workers, and media services over HTTPS.',
      status: 'online',
      statusCode: null,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
      details: 'Architecture node shown for topology context.'
    },
    {
      id: 'mobile-platform',
      name: 'Mobile platform',
      kind: 'client',
      url: null,
      description: 'Consumes the same shared backend and worker services as the web platform.',
      status: 'online',
      statusCode: null,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
      details: 'Architecture node shown for topology context.'
    }
  ]

  return {
    checkedAt: new Date().toISOString(),
    services: [...checkedServices, ...clientNodes]
  }
})
