import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

interface AppUser { profileType?: string; id_tipo?: string; [key: string]: any }

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) {
        return this.router.parseUrl('/');
      }
      const user: AppUser = JSON.parse(raw);
      const required: string | undefined = route.data && route.data['requiredRole'];

      const role = (user.profileType || user.id_tipo || '').toString();
      if (!role) return this.router.parseUrl('/folder/inbox');
      if (role === 'Administrador') return true;

      if (!required) {
        return this.router.parseUrl('/folder/inbox');
      }

      if (role === required || role === required.toString()) return true;

      if (Array.isArray(required) && required.includes(role)) return true;

      return this.router.parseUrl('/folder/inbox');
    } catch (e) {
      return this.router.parseUrl('/folder/inbox');
    }
  }
}
