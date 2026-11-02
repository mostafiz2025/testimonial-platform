import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
