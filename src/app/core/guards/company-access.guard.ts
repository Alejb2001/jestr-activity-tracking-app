import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const companyAccessGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasCompanyModuleAccess()) {
    return router.createUrlTree(['/activities']);
  }

  // company_admin can only access their own company — redirect /companies list to their detail
  if (auth.isCompanyAdmin()) {
    const user = auth.getCurrentUser();
    const requestedId = route.paramMap.get('id');

    if (!requestedId && user?.companyId) {
      return router.createUrlTree(['/companies', user.companyId]);
    }

    if (requestedId && user?.companyId && +requestedId !== user.companyId) {
      return router.createUrlTree(['/companies', user.companyId]);
    }
  }

  return true;
};
