import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthServices } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isModalOpen: boolean = false;
  user: User | null = null;
  private userSubscription!: Subscription;
  private logoutSubscription!: Subscription;

  constructor(private router: Router, private authService: AuthServices) {}

  ngOnInit() {
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }

  logout() {
    this.logoutSubscription = this.authService.logout().subscribe(() => {
      this.router.navigate(['']);
    });
  }

  goToProfile(): void {
    this.router.navigate(['/blog/profile']);
    this.isModalOpen = false;
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
  }
}