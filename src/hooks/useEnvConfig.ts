'use client'

import { useState, useEffect } from 'react'
import { EVENT_CONFIG, getEventName, getEventStartDate, getEventEndDate, getEventDates } from '@/constants/constants'

export interface EnvConfig {
    eventName: string
    eventStartDate: string
    eventEndDate: string
    eventDates: string
}

const defaultConfig: EnvConfig = {
    eventName: EVENT_CONFIG.DEFAULT_EVENT_NAME,
    eventStartDate: EVENT_CONFIG.DEFAULT_START_DATE,
    eventEndDate: EVENT_CONFIG.DEFAULT_END_DATE,
    eventDates: `${EVENT_CONFIG.DEFAULT_START_DATE} to ${EVENT_CONFIG.DEFAULT_END_DATE}`
}

export function useEnvConfig(): EnvConfig {
    const [config, setConfig] = useState<EnvConfig>(defaultConfig)

    useEffect(() => {
        // Set actual environment values after hydration
        const actualConfig: EnvConfig = {
            eventName: getEventName(),
            eventStartDate: getEventStartDate(),
            eventEndDate: getEventEndDate(),
            eventDates: getEventDates()
        }

        setConfig(actualConfig)
    }, [])

    return config
} 