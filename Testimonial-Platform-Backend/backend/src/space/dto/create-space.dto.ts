import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { WallLayout, WallTheme } from '../entity/space.entity';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSpaceDTO {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  /** optional custom url part: /s/<slug>. Generated from the name when omitted */
  @IsOptional()
  @Transform(trim)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Slug may only contain lowercase letters, numbers and hyphens',
  })
  @MaxLength(60)
  slug?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  header_title?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1500)
  custom_message?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  questions?: string[];

  @IsOptional() @IsBoolean() collect_text?: boolean;
  @IsOptional() @IsBoolean() collect_video?: boolean;
  @IsOptional() @IsBoolean() collect_star_rating?: boolean;
  @IsOptional() @IsBoolean() collect_email?: boolean;
  @IsOptional() @IsBoolean() collect_company?: boolean;
  @IsOptional() @IsBoolean() collect_job_title?: boolean;
  @IsOptional() @IsBoolean() collect_photo?: boolean;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  thank_you_title?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  thank_you_message?: string;

  @IsOptional()
  @Matches(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, {
    message: 'button_color must be a hex color like #6366f1',
  })
  button_color?: string;

  @IsOptional() @IsBoolean() is_active?: boolean;

  @IsOptional() @IsEnum(WallTheme) wall_theme?: WallTheme;
  @IsOptional() @IsEnum(WallLayout) wall_layout?: WallLayout;
  @IsOptional() @IsBoolean() wall_show_rating?: boolean;
  @IsOptional() @IsBoolean() wall_show_date?: boolean;
  @IsOptional() @IsBoolean() wall_show_branding?: boolean;
}
