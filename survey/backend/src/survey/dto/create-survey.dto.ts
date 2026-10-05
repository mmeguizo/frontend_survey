import { IsString, IsIn, IsInt, IsOptional, IsEmail, Min, Max, IsBoolean } from 'class-validator';

export class CreateSurveyDto {
  @IsOptional()
  @IsString()
  ticketId?: string;

  @IsString()
  @IsIn(['CITIZEN', 'BUSINESS', 'GOVERNMENT'])
  clientType: string;

  @IsString()
  date: string;

  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  sex: string;

  @IsInt()
  @Min(1)
  @Max(150)
  age: number;

  @IsString()
  regionOfResidence: string;

  @IsOptional()
  @IsBoolean()
  serviceTalisay?: boolean = false;

  @IsOptional()
  @IsBoolean()
  serviceExternal?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  cc1Awareness?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  cc2Visibility?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  cc3Helpfulness?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd0?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd1?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd2?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd3?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd4?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd5?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd6?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd7?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sqd8?: number;

  @IsOptional()
  @IsString()
  suggestions?: string;

  @IsOptional()
  @IsEmail()
  emailAddress?: string;
}