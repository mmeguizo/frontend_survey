import { Expose, Type } from 'class-transformer';
import { IsInt, IsString, IsBoolean, IsOptional, Min, Max, IsEmail } from 'class-validator';

export class SurveyResponseDto {
  @Expose() @IsInt() id: number;
  @Expose() @IsString() ticketId: string;
  @Expose() @IsString() clientType: string;
  @Expose() @IsString() date: string;
  @Expose() @IsString() sex: string;
  @Expose() @IsInt() age: number;
  @Expose() @IsString() regionOfResidence: string;
  @Expose() @IsBoolean() serviceTalisay: boolean;
  @Expose() @IsBoolean() serviceExternal: boolean;
  @Expose() @IsOptional() @IsInt() cc1Awareness?: number;
  @Expose() @IsOptional() @IsInt() cc2Visibility?: number;
  @Expose() @IsOptional() @IsInt() cc3Helpfulness?: number;
  @Expose() @IsOptional() @IsInt() sqd0?: number;
  @Expose() @IsOptional() @IsInt() sqd1?: number;
  @Expose() @IsOptional() @IsInt() sqd2?: number;
  @Expose() @IsOptional() @IsInt() sqd3?: number;
  @Expose() @IsOptional() @IsInt() sqd4?: number;
  @Expose() @IsOptional() @IsInt() sqd5?: number;
  @Expose() @IsOptional() @IsInt() sqd6?: number;
  @Expose() @IsOptional() @IsInt() sqd7?: number;
  @Expose() @IsOptional() @IsInt() sqd8?: number;
  @Expose() @IsOptional() @IsString() suggestions?: string;
  @Expose() @IsOptional() @IsEmail() emailAddress?: string;
  @Expose() @IsString() createdAt: string;
  @Expose() @IsString() updatedAt: string;
}