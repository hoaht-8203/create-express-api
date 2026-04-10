import { Controller, Get, Route, Tags } from 'tsoa'
import { AppResponse } from '~/config/type'

@Route('api/health')
@Tags('Health')
export class HealthController extends Controller {
  @Get()
  public async health(): Promise<AppResponse<string>> {
    return { message: 'Server is running at port ' + process.env.PORT, data: 'OK' }
  }
}
