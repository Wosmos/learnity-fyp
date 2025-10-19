'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { GraduationCap, Users, Shield } from 'lucide-react'

const roles = [
  {
    id: 'STUDENT',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'TEACHER',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'ADMIN',
    icon: Shield,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200'
  }
]

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations('auth')

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
  }

  const handleContinue = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    
    // Store selected role in localStorage for the signup process
    localStorage.setItem('selectedRole', selectedRole)
    
    // Redirect to appropriate signup flow
    if (selectedRole === 'TEACHER') {
      router.push('/auth/teacher-signup')
    } else {
      router.push('/auth/signup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-learnity-50 via-white to-learnity-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('selectRole')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started with Learnity's gamified learning experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role, index) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? `ring-2 ring-offset-2 ring-learnity-500 ${role.borderColor}` 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      {t(role.id.toLowerCase())}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-sm leading-relaxed">
                      {t(`${role.id.toLowerCase()}Desc`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            variant="gamified"
            size="xl"
            className="min-w-48"
          >
            {isLoading ? t('common.loading') : t('common.next')}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}