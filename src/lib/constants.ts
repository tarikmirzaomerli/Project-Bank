import { Profile } from '@/types'

export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export const TEST_USER_CREDENTIALS = {
  username: 'test',
  email: 'test@paratakip.local',
  password: 'test',
} as const

export const TEST_ADMIN_USER: Profile = {
  id: TEST_USER_ID,
  user_code: 'WTR-TEST',
  full_name: 'Yönetici / Test Kullanıcısı',
  email: 'test@paratakip.local',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}
