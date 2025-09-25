import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notify.entity';
import { NotificationService } from './notify.service';
import { NotificationController } from './notify.controller';
import { SharedModule } from '../shared/shared.module';
import { NotifyGateway } from './notify.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), SharedModule],
  providers: [NotificationService, NotifyGateway],
  controllers: [NotificationController],
  exports: [NotificationService, NotifyGateway],
})
export class NotificationModule {}
