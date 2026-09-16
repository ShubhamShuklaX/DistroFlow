import { prisma } from '../db';

export async function recordAuditLog({
  userId,
  userName,
  userRole,
  action,
  entity,
  details,
}: {
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  details: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        userName,
        userRole,
        action,
        entity,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}

export async function createNotification({
  targetRole,
  userId,
  title,
  message,
  type = 'system',
}: {
  targetRole: string;
  userId?: string;
  title: string;
  message: string;
  type?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        targetRole,
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
