import { Request as ExpressRequest } from 'express'
import { Body, Controller, Get, Middlewares, Post, Request, Route, Tags } from 'tsoa'
import { AppResponse } from '~/config/type'
import { authenticate, authorize } from '~/middlewares/auth.middleware'
import { zodValidateBody } from '~/middlewares/zodValidate'
import { TokenPayload } from '~/utils/jwt'
import { LoginSchema, RegisterSchema } from './auth.schema'
import { AuthService } from './auth.service'
import { AuthSuccessResponseDTO, LoginRequest, RegisterRequest } from './auth.type'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

@Route('api/auth')
@Tags('Auth')
export class AuthController extends Controller {
  /**
   * Register a new user
   */
  @Post('register')
  @Middlewares(zodValidateBody(RegisterSchema))
  public async register(
    @Body() requestBody: RegisterRequest,
    @Request() req: ExpressRequest
  ): Promise<AppResponse<AuthSuccessResponseDTO>> {
    const { rawRefreshToken, ...data } = await AuthService.register(requestBody)
    if (req.res) req.res.cookie('refreshToken', rawRefreshToken, COOKIE_OPTIONS)

    return { message: 'Registered successfully', data }
  }

  @Post('login')
  @Middlewares(zodValidateBody(LoginSchema))
  public async login(
    @Body() requestBody: LoginRequest,
    @Request() req: ExpressRequest
  ): Promise<AppResponse<AuthSuccessResponseDTO>> {
    const { rawRefreshToken, ...data } = await AuthService.login(requestBody)
    if (req.res) req.res.cookie('refreshToken', rawRefreshToken, COOKIE_OPTIONS)

    return { message: 'Login successfully', data }
  }

  @Post('logout')
  public async logout(@Request() req: ExpressRequest): Promise<AppResponse<string>> {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) {
      await AuthService.logout(refreshToken)
    }

    if (req.res) req.res.clearCookie('refreshToken')

    return { message: 'logout successfully', data: '' }
  }

  @Post('refresh-token')
  public async refreshToken(@Request() req: ExpressRequest): Promise<AppResponse<AuthSuccessResponseDTO>> {
    const cookieToken = req.cookies?.refreshToken
    if (!cookieToken) {
      throw new Error('Refresh token missing')
    }

    const { rawRefreshToken, ...data } = await AuthService.refreshToken(cookieToken)

    if (req.res) req.res.cookie('refreshToken', rawRefreshToken, COOKIE_OPTIONS)

    return { message: 'Tokens refreshed successfully', data }
  }

  @Get('me')
  @Middlewares(authenticate)
  public async me(@Request() req: ExpressRequest): Promise<AppResponse<TokenPayload | undefined>> {
    return { message: 'Get profile successfully', data: req.user }
  }

  @Get('admin-only')
  @Middlewares([authenticate, authorize('ADMIN')])
  public async adminOnly(@Request() req: ExpressRequest): Promise<AppResponse<string>> {
    return { message: 'You have admin access', data: `Welcome Admin ${req.user?.email}` }
  }
}
