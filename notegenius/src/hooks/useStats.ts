import { useState, useEffect, useCallback } from 'react'
import type { SubjectStats, HeatmapEntry, MemorizationPoint, GlobalStats } from '../services/statsService'
import { getSubjectStats, getHeatmapData, getMemorizationCurve, getGlobalStats } from '../services/statsService'

interface UseStatsReturn {
  subjectStats: SubjectStats | null
  heatmapData: HeatmapEntry[]
  memorizationCurve: MemorizationPoint[]
  globalStats: GlobalStats | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useStats(noteId: string): UseStatsReturn {
  const [subjectStats, setSubjectStats] = useState<SubjectStats | null>(null)
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [memorizationCurve, setMemorizationCurve] = useState<MemorizationPoint[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [global, heatmap] = await Promise.all([
        getGlobalStats(),
        getHeatmapData()
      ])

      setGlobalStats(global)
      setHeatmapData(heatmap)

      // Stats par note seulement si noteId valide
      if (noteId && noteId !== 'default') {
        const [subject, curve] = await Promise.all([
          getSubjectStats(noteId),
          getMemorizationCurve(noteId)
        ])
        setSubjectStats(subject)
        setMemorizationCurve(curve)
      }
    } catch (err) {
      setError('Erreur lors du chargement des statistiques.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  useEffect(() => { load() }, [load])

  return { subjectStats, heatmapData, memorizationCurve, globalStats, isLoading, error, refresh: load }
}