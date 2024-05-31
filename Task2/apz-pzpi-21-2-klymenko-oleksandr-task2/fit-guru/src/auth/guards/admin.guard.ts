import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminRequired = this.reflector.get<boolean>(
      'isAdmin',
      context.getHandler(),
    );

    if (!isAdminRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as Request;
    const data = request.user;
    return !!data.isAdmin;
  }
}
