import { Controller, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Controller('auth')
export class AuthController {

  constructor(private jwtService: JwtService) {}

  @Get('token')
  generateToken() {

    const token = this.jwtService.sign({
      user_id: 123,
      username: 'test_user',
      role: 'admin'
    });

    return {
      token,
      type: 'Bearer',
      expiresIn: '2h'
    };
  }
}
