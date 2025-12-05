import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private facadeService: FacadeService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Obtener roles permitidos de la configuración de la ruta
    const allowedRoles = route.data['roles'] as Array<string>;

    // Delegar toda la lógica al FacadeService
    return this.facadeService.canAccess(allowedRoles);
  }
}
