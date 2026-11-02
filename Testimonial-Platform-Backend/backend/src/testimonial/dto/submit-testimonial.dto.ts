import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;
const toBool = ({ value }: { value: unknown }) =>
  value === 'true' || value === true || value === '1' || value === 1;

/** Used by the public collection form (multipart/form-data) */
export class SubmitTestimonialDTO {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Your name is required' })
  @MaxLength(100)
  name!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid e-mail' })
  @MaxLength(150)
  email?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  job_title?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  message?: string;

  @Transform(toBool)
  @IsBoolean()
  consent!: boolean;
}

/** Used when the space owner adds / imports a testimonial manually (JSON) */
export class ImportTestimonialDTO {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional() @IsString() @MaxLength(150) job_title?: string;
  @IsOptional() @IsString() @MaxLength(150) company?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  message!: string;
}
