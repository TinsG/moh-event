// Event Configuration Constants
export const EVENT_CONFIG = {
    // Default event information
    DEFAULT_EVENT_NAME: 'GHIQS 2025',
    DEFAULT_START_DATE: '2025-06-25',
    DEFAULT_END_DATE: '2025-06-27',

    // Event duration
    EVENT_DURATION_DAYS: 3,
    VALID_EVENT_DAYS: [1, 2, 3] as const,

    // Date format strings
    DATE_DISPLAY_FORMAT: 'MMM dd, yyyy',
    DATE_TIME_FORMAT: 'MMM dd, yyyy HH:mm',
    DATE_INPUT_FORMAT: 'YYYY-MM-DD',

    // Event status messages
    EVENT_STATUS: {
        ACTIVE: 'Active',
        INACTIVE: 'Event Inactive',
        OUTSIDE_DATES: 'Event is not currently active. Please check the event dates.'
    },

    // Day labels for UI
    DAY_LABELS: {
        1: 'Day 1',
        2: 'Day 2',
        3: 'Day 3'
    } as const
} as const

// Email Configuration Constants
export const EMAIL_CONFIG = {
    SENDER_NAME: 'MOH Event Team',
    EMAIL_SUBJECT_PREFIX: 'Registration Confirmed - ',
    DEFAULT_FROM_EMAIL: 'tgetachew1996@gmail.com',

    // Email template text
    CONFIRMATION_SUBJECT: 'Registration Confirmation',
    QR_CODE_INSTRUCTIONS: {
        SAVE_EMAIL: 'Save this email or screenshot the QR code above',
        PRESENT_QR: 'Present your QR code at the event entrance each day',
        ONCE_PER_DAY: 'You can check in once per day during the 3-day event',
        VISIBILITY: 'Make sure your QR code is clearly visible when scanning'
    }
} as const

// QR Code Configuration Constants
export const QR_CONFIG = {
    MAX_WIDTH: 250,
    TEMP_ID_PREFIX: 'temp_',
    QR_CODE_SIZE: {
        WIDTH: 250,
        HEIGHT: 'auto'
    }
} as const

// Attendance Configuration Constants  
export const ATTENDANCE_CONFIG = {
    MAX_DAYS: 3,
    MIN_DAY: 1,
    INVALID_DAY_INDICATOR: -1,

    // Check-in messages
    MESSAGES: {
        ALREADY_MARKED: 'Attendance already marked for Day',
        SUCCESS: 'Attendance marked successfully',
        ERROR_CHECKING: 'Error checking attendance records.',
        OUTSIDE_EVENT: 'Event is not currently active. Please check the event dates.'
    }
} as const

// UI Display Constants
export const UI_CONSTANTS = {
    BADGES: {
        ACTIVE_VARIANT: 'default',
        INACTIVE_VARIANT: 'secondary',
        OUTLINE_VARIANT: 'outline'
    },

    REGISTRATION_FORM: {
        TITLE: 'Event Registration',
        DESCRIPTION_PREFIX: 'Please fill in your details to register for Global Health Innovation and Quality Summit 2025'
    },

    DASHBOARD: {
        TITLE_REGISTRATION_COUNT: 'Total Registrations',
        TITLE_CURRENT_DAY: 'Current Day',
        DESCRIPTION_REGISTRATIONS: 'Registered attendees',
        DESCRIPTION_PROGRESS: 'Event progress'
    }
} as const

// Database Constants
export const DB_CONSTANTS = {
    TABLES: {
        REGISTRATIONS: 'registrations',
        ATTENDANCE: 'attendance',
        USERS: 'users'
    },

    CONSTRAINTS: {
        DAY_MIN: 1,
        DAY_MAX: 3
    }
} as const

// Helper functions to get dynamic values
export const getEventName = (): string => {
    return process.env.NEXT_PUBLIC_EVENT_NAME || EVENT_CONFIG.DEFAULT_EVENT_NAME
}

export const getEventStartDate = (): string => {
    return process.env.NEXT_PUBLIC_EVENT_START_DATE || EVENT_CONFIG.DEFAULT_START_DATE
}

export const getEventEndDate = (): string => {
    return process.env.NEXT_PUBLIC_EVENT_END_DATE || EVENT_CONFIG.DEFAULT_END_DATE
}

export const getEventDates = (): string => {
    return `${getEventStartDate()} to ${getEventEndDate()}`
}

export const getEventInfo = () => ({
    name: getEventName(),
    startDate: getEventStartDate(),
    endDate: getEventEndDate(),
    dates: getEventDates()
})
