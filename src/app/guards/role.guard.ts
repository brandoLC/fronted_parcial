// src/app/guards/role.guard.ts (Corregido para usar AuthService.currentUserValue o AuthService.userRole)
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot, // Añadido por completitud, aunque 'state' no se usa explícitamente aquí
  UrlTree
} from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Ajusta la ruta

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as string;
  const actualUserRole = authService.userRole; // <--- CORRECCIÓN: Usa el getter userRole

  // O podrías usar el método hasRole que ya tenías:
  // if (authService.hasRole(expectedRole)) {

  if (actualUserRole && actualUserRole === expectedRole) {
    return true;
  }

  console.warn(`Acceso denegado. Rol esperado: "<span class="math-inline">\{expectedRole\}", Rol actual\: "</span>{actualUserRole}"`);
  // Redirigir a una ruta apropiada, por ejemplo, el dashboard principal o una página de acceso denegado.
  return router.createUrlTree(['/app/dashboard']); // O la ruta que consideres por defecto si el rol no coincide
};
