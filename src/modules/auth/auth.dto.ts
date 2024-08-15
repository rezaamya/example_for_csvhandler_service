import { IsNotEmpty, Matches } from 'class-validator';
import { regExpValidEmail, regExpValidPassword } from './auth.constant';
import {
  msgEmailIsMandatory,
  msgEmailRequirements,
  msgPasswordIsMandatory,
  msgPasswordRequirements,
} from './auth.msg';

export class RegisterRequestBodyDto {
  @IsNotEmpty({ message: msgEmailIsMandatory })
  @Matches(regExpValidEmail, {
    message: msgEmailRequirements,
  })
  email: string;

  @IsNotEmpty({ message: msgPasswordIsMandatory })
  @Matches(regExpValidPassword, {
    message: msgPasswordRequirements,
  })
  password: string;
}

export class RegisterResponseDto {
  message: string;
}

export class LoginRequestBodyDto extends RegisterRequestBodyDto {}

export class LoginResponseDto {
  token: string;
}
