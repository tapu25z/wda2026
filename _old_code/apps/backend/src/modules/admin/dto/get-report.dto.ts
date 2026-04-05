import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum GroupBy {
  DAY = 'day',
  MONTH = 'month',
}

export class GetReportDto {
  @IsDateString()
  from: string; // ISO string: '2026-01-01'

  @IsDateString()
  to: string; // ISO string: '2026-03-31'

  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy = GroupBy.DAY;
}

export class CompareMonthDto {
  @IsDateString()
  month1: string; // '2026-01-01' → lấy tháng 1

  @IsDateString()
  month2: string; // '2026-02-01' → lấy tháng 2
}