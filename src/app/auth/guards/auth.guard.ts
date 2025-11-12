import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);


    canActivate(): boolean {
        if (this.authService.getToken()) {
            return true;
        } else {
            this.router.navigate(['/']);
            return false;
        }
    }

    canActivateChild(): boolean {
        return this.canActivate();
    }
}