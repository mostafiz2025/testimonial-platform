import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum TestimonialFilter {
  INBOX = 'inbox', // everything that is not archived
  TEXT = 'text',
  VIDEO = 'video',
  LIKED = 'liked',
  ARCHIVED = 'archived',
}

export class QueryTestimonialDTO {
  @IsOptional()
  @IsEnum(TestimonialFilter)
  filter?: TestimonialFilter;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
