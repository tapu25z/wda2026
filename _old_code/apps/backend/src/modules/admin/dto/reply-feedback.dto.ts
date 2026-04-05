import { IsString, MinLength, MaxLength } from 'class-validator';

export class ReplyFeedbackDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reply: string;
}