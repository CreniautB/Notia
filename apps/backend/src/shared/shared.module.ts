import { Module } from '@nestjs/common';
import { NlpService } from './services/nlp.service';

@Module({
  providers: [NlpService],
  exports: [NlpService],
})
export class SharedModule {}
