export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface UserResponseDTO {
  id: number
  email: string
  name: string | null
  roleId: number
  roleName: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokensDTO {
  accessToken: string
}

export interface AuthSuccessResponseDTO {
  user: UserResponseDTO
  tokens: AuthTokensDTO
}
