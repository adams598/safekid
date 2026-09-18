import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, SocketUser>();

export function setupSocketHandlers(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error('Token manquant'));
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'safekid_secret') as {
        userId: string;
      };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    connectedUsers.set(userId, { userId, socketId: socket.id });

    console.log(`👤 User connected: ${userId} (${socket.id})`);

    // Parent subscribes to a child's location updates
    socket.on('subscribe:child', (childId: string) => {
      socket.join(`child:${childId}`);
      console.log(`📍 User ${userId} subscribed to child ${childId}`);
    });

    // Parent unsubscribes
    socket.on('unsubscribe:child', (childId: string) => {
      socket.leave(`child:${childId}`);
    });

    // Chip sends location (alternative to HTTP endpoint — lower latency)
    socket.on('chip:location', (data: {
      chipId: string;
      childId: string;
      latitude: number;
      longitude: number;
      speed: number;
      batteryLevel: number;
    }) => {
      // Broadcast to all parents subscribed to this child
      io.to(`child:${data.childId}`).emit('location:update', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Zone breach event (sent by backend logic after geofence check)
    socket.on('zone:alert', (data: {
      childId: string;
      type: 'zone_exit' | 'zone_entry';
      zoneName: string;
      address: string;
      latitude: number;
      longitude: number;
    }) => {
      io.to(`child:${data.childId}`).emit('alert:zone', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Chip SOS button pressed
    socket.on('chip:sos', (data: { chipId: string; childId: string; latitude: number; longitude: number }) => {
      io.to(`child:${data.childId}`).emit('alert:sos', {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`🚨 SOS from chip ${data.chipId} for child ${data.childId}`);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`👤 User disconnected: ${userId}`);
    });
  });
}
