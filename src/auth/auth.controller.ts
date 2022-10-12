import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, LoginInput, SignupInput } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Post('signup')
  async signup(@Body() signupInput: SignupInput): Promise<AuthResponse> {
    return this.authService.signup(signupInput);
  }
}
