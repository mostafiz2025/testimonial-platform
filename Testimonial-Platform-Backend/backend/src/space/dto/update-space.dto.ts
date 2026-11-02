import { PartialType } from '@nestjs/mapped-types';
import { CreateSpaceDTO } from './create-space.dto';

export class UpdateSpaceDTO extends PartialType(CreateSpaceDTO) {}
