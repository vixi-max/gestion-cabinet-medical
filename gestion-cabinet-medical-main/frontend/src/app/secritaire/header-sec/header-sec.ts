import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-sec',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-sec.html',
  styleUrls: ['./header-sec.scss'],
})
export class HeaderSec implements OnInit {
  // Données de la secrétaire
  secretaryName = 'Marie Dupont';
  notificationCount = 3;
  showUserMenu = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Récupérer les informations de la secrétaire connectée
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('secretaryData');
      if (userData) {
        const data = JSON.parse(userData);
        this.secretaryName = data.name || 'Secrétaire';
      }
    }
  }

  // Basculer le menu utilisateur
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  // Déconnexion
  logout() {
    // Nettoyer le localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('secretaryToken');
      localStorage.removeItem('secretaryData');
    }
    
    // Rediriger vers la page de login
    this.router.navigate(['/login']);
    
    // Fermer le menu
    this.showUserMenu = false;
  }

  // Fermer le menu si on clique ailleurs
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showUserMenu = false;
    }
  }
}