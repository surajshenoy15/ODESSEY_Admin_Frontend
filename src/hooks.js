import { useCallback, useEffect, useState } from 'react'

export function useAsyncResource(loader, dependencies = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await loader()
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Something went wrong')
      throw err
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    if (immediate) reload().catch(() => {})
  }, [immediate, reload])

  return { data, setData, loading, error, reload }
}
