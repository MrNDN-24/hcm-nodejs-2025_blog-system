import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
// Đánh dấu class này là một WebSocket Gateway (cổng realtime)
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class NotifyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Lưu trữ user đang online: userId -> socketId
  private onlineUsers: Record<number, string> = {};

  // Hàm này chạy ngay khi Gateway được khởi tạo
  afterInit(server: Server) {
    console.log('NotifyGateway initialized');
  }

  // Hàm này chạy khi có 1 client kết nối tới server
  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId) {
      this.onlineUsers[userId] = client.id;
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  // Hàm này chạy khi 1 client ngắt kết nối
  handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId && this.onlineUsers[userId] === client.id) {
      delete this.onlineUsers[userId];
      console.log(`User ${userId} disconnected`);
    }
  }

  // Hàm gửi notification realtime tới 1 user cụ thể
  sendNotification(userId: number, payload: any) {
    const socketId = this.onlineUsers[userId];
    if (socketId) {
      this.server.to(socketId).emit('notification', payload);
    }
  }
}
