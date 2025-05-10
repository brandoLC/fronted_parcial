// src/app/core/guards/auth.guard.ts (Corregido)
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
  RouterStateSnapshot, // Importar si se usa state
  ActivatedRouteSnapshot // Importar si se usa route
} from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Ajusta la ruta

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) { // Acceder como propiedad (getter)
    return true;
  }

  // Redirigir a la página de autenticación
  return router.createUrlTree(['/auth']); // O la ruta de tu AuthPageComponent
};
