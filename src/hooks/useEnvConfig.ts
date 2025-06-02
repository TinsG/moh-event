'use client'

import { useState, useEffect } from 'react'

export interface EnvConfig {
    eventName: string
    eventStartDate: string
    eventEndDate: string
    eventDates: string
}

const defaultConfig: EnvConfig = {
    eventName: 'MOH Event 2024',
    eventStartDate: '2024-03-01',
    eventEndDate: '2024-03-03',
    eventDates: '2024-03-01 to 2024-03-03'
}

export function useEnvConfig(): EnvConfig {
    const [config, setConfig] = useState<EnvConfig>(defaultConfig)

    useEffect(() => {
        // Set actual environment values after hydration
        const actualConfig: EnvConfig = {
            eventName: process.env.NEXT_PUBLIC_EVENT_NAME || defaultConfig.eventName,
            eventStartDate: process.env.NEXT_PUBLIC_EVENT_START_DATE || defaultConfig.eventStartDate,
            eventEndDate: process.env.NEXT_PUBLIC_EVENT_END_DATE || defaultConfig.eventEndDate,
            eventDates: `${process.env.NEXT_PUBLIC_EVENT_START_DATE || defaultConfig.eventStartDate} to ${process.env.NEXT_PUBLIC_EVENT_END_DATE || defaultConfig.eventEndDate}`
        }

        setConfig(actualConfig)
    }, [])

    return config
} 