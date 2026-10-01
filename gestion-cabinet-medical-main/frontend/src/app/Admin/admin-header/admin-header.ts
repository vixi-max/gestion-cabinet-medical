import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CabinetService } from '../../services/cabinet';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
})
export class AdminHeader implements OnInit {
  adminName: string = 'Admin';
  currentCabinet: any = null;
  currentCabinetId: string | null = null; // Changé à string | null
  cabinets: any[] = [];
  showUserMenu: boolean = false;
  notificationCount: number = 0;
  isSuperAdmin: boolean = false;

  constructor(
    private router: Router,
    private cabinetService: CabinetService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAdminProfile();
    this.loadCabinets();
    this.checkSuperAdminStatus();
  }

  loadAdminProfile() {
    // Récupérer les infos de l'admin connecté
    const admin = this.authService.getCurrentUser();
    if (admin) {
      this.adminName = admin.nom + ' ' + admin.prenom;
      // CORRECTION ICI : Convertir en string si défini, sinon null
      this.currentCabinetId = admin.cabinetId ? admin.cabinetId.toString() : null;
    }
  }

  loadCabinets() {
    this.cabinetService.getAllCabinets().subscribe({
      next: (cabinets) => {
        this.cabinets = cabinets;
        this.setCurrentCabinet();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cabinets:', error);
      }
    });
  }

  setCurrentCabinet() {
    if (this.currentCabinetId && this.cabinets.length > 0) {
      // Utiliser == pour la comparaison car types différents (string vs number)
      this.currentCabinet = this.cabinets.find(c => 
        c.id == this.currentCabinetId // == au lieu de === pour comparer string et number
      );
    }
  }

  checkSuperAdminStatus() {
    this.isSuperAdmin = this.authService.isSuperAdmin();
  }

  onCabinetChange(event: any) {
    const cabinetId = event.target.value;
    if (cabinetId) {
      this.cabinetService.setCurrentCabinet(cabinetId).subscribe({
        next: (cabinet) => {
          this.currentCabinet = cabinet;
          this.currentCabinetId = cabinetId;
          // Recharger les données basées sur le cabinet sélectionné
          this.reloadCabinetData();
        },
        error: (error) => {
          console.error('Erreur lors du changement de cabinet:', error);
        }
      });
    } else {
      this.currentCabinet = null;
      this.currentCabinetId = null; // Mettre à null au lieu de ''
      // Recharger toutes les données
      this.reloadAllData();
    }
  }

  reloadCabinetData() {
    // Réinitialiser les données basées sur le cabinet
    console.log('Rechargement des données pour le cabinet:', this.currentCabinetId);
    // Émettre un événement pour informer les autres composants
  }

  reloadAllData() {
    // Réinitialiser toutes les données
    console.log('Rechargement de toutes les données');
    // Émettre un événement pour informer les autres composants
  }

  switchCabinet() {
    // Ouvrir un modal pour changer de cabinet
    this.showUserMenu = false;
    // Implémenter la logique de changement de cabinet
  }

  openNotifications() {
    this.showUserMenu = false;
    this.router.navigate(['/admin/notifications']);
  }

  goToSuperAdmin() {
    this.showUserMenu = false;
    this.router.navigate(['/super-admin']);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}