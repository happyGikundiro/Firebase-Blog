import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthServices } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {

  isModalOpen: boolean = false;
  user$!: Observable<User | null>;
  private logoutSubscription!: Subscription;
  showAddForm = false;

  constructor(private router: Router, private authService: AuthServices) {}

  ngOnInit() {
    this.user$ = this.authService.getCurrentUser();
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

  closeAddForm() {
    this.showAddForm = false;
  }

  ngOnDestroy() {
    this.logoutSubscription.unsubscribe();
  }
}