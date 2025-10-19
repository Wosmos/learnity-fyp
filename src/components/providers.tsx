'use client'

import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import { useState, useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [messages, setMessages] = useState({})
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    // Get locale from localStorage or browser
    const savedLocale = localStorage.getItem('locale') || 
                       navigator.language.split('-')[0] || 'en'
    
    const supportedLocales = ['en', 'ur', 'sd']
    const finalLocale = supportedLocales.includes(savedLocale) ? savedLocale : 'en'
    
    setLocale(finalLocale)
    
    // Load messages dynamically
    import(`../../messages/${finalLocale}.json`)
      .then((msgs) => setMessages(msgs.default))
      .catch(() => import('../../messages/en.json')
        .then((msgs) => setMessages(msgs.default)))
  }, [])

  return (
    <SessionProvider>
      <NextIntlClientProvider 
        locale={locale} 
        messages={messages}
        timeZone="Asia/Karachi"
      >
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  )
}