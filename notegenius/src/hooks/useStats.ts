// src/hooks/useStats.ts
import { useState, useEffect, useCallback } from "react"
import type { SubjectStats, HeatmapEntry, MemorizationPoint, GlobalStats } from "../services/statsService"
import {
  getSubjectStats,
  getHeatmapData,
  getMemorizationCurve,
  getGlobalStats
} from "../services/statsService"

// ── Types de retour
interface UseStatsReturn {
  // Données
  subjectStats: SubjectStats | null
  heatmapData: HeatmapEntry[]
  memorizationCurve: MemorizationPoint[]
  globalStats: GlobalStats | null

  // État
  isLoading: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

export function useStats(noteId: string): UseStatsReturn {
  const [subjectStats, setSubjectStats] = useState<SubjectStats | null>(null)
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [memorizationCurve, setMemorizationCurve] = useState<MemorizationPoint[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Charger toutes les stats en parallèle
  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [subject, heatmap, curve, global] = await Promise.all([
        getSubjectStats(noteId),
        getHeatmapData(),
        getMemorizationCurve(noteId),
        getGlobalStats()
      ])

      setSubjectStats(subject)
      setHeatmapData(heatmap)
      setMemorizationCurve(curve)
      setGlobalStats(global)
    } catch (err) {
      setError("Erreur lors du chargement des statistiques.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    load()
  }, [load])

  return {
    subjectStats,
    heatmapData,
    memorizationCurve,
    globalStats,
    isLoading,
    error,
    refresh: load
  }
}