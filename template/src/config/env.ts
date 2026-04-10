import dotenv from 'dotenv'
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
})

export const env = {
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT || 3000
}
