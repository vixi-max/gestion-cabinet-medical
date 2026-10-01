import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-med',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-med.html',
 styleUrls: ['./header-med.scss'] 
})
export class HeaderMed {
  showUserMenu = false;
  doctorName = 'Dr. Sophie Martin';
  notificationCount = 3;

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    // Implémentez la logique de déconnexion ici
    console.log('Déconnexion...');
  }
}