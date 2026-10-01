import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CabinetService, Cabinet } from '../../services/cabinet';
import { AuthService, User } from '../../services/auth';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend: number;
  trendLabel: string;
  description: string;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'cabinet' | 'appointment' | 'payment';
  title: string;
  description: string;
  time: string;
  user: string;
  status: string;
}

interface CabinetSummary {
  id: number;
  name: string;
  medecins: number;
  secretaires: number;
  patients: number;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
}

interface CabinetFormData {
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  logo?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit, OnDestroy {
  adminName: string = 'Administrateur';
  currentDate: string = '';
  currentTime: string = '';
  private timeInterval: any;
  
  // États du composant
  showCabinetForm: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  
  // Formulaire de cabinet
  newCabinet: CabinetFormData = {
    nomCabinet: '',
    adresseCabinet: '',
    emailCabinet: '',
    teleCabinet: '',
    logo: ''
  };
  
  // Statistiques
  stats: StatCard[] = [];
  
  // Cabinets récents
  recentCabinets: CabinetSummary[] = [];
  
  // Activités récentes
  recentActivities: RecentActivity[] = [];
  
  // Pour utiliser Math dans le template
  Math = Math;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cabinetService: CabinetService
  ) {}

  ngOnInit() {
    this.loadAdminProfile();
    this.initDateTime();
    this.loadDashboardData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  // Méthode utilitaire pour convertir hex en RGB
  hexToRgb(hex: string): string {
    // Supprimer le # s'il existe
    hex = hex.replace(/^#/, '');
    
    // Convertir les valeurs hex en décimal
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }

  loadAdminProfile() {
    const admin = this.authService.getCurrentUser();
    if (admin) {
      this.adminName = `${admin.prenom} ${admin.nom}`;
    }
  }

  initDateTime() {
    this.updateDateTime();
    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 60000); // Mettre à jour chaque minute
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.currentTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadDashboardData() {
    this.loadStats();
    this.loadRecentCabinets();
    this.loadRecentActivities();
  }

  loadStats() {
    // Données mockées
    this.stats = [
      {
        title: 'Total Cabinets',
        value: 12,
        icon: 'fas fa-clinic-medical',
        color: '#0ea5e9',
        trend: 15,
        trendLabel: 'ce mois',
        description: 'Cabinets actifs'
      },
      {
        title: 'Médecins',
        value: 48,
        icon: 'fas fa-user-md',
        color: '#10B981',
        trend: 8,
        trendLabel: 'nouveaux',
        description: 'Médecins actifs'
      },
      {
        title: 'Secrétaires',
        value: 24,
        icon: 'fas fa-user-nurse',
        color: '#8B5CF6',
        trend: 12,
        trendLabel: 'ce trimestre',
        description: 'Secrétaires actives'
      },
      {
        title: 'Revenus',
        value: 152400,
        icon: 'fas fa-euro-sign',
        color: '#F59E0B',
        trend: 23,
        trendLabel: 'vs mois dernier',
        description: 'Total revenus mensuels'
      },
      {
        title: 'Patients',
        value: 1560,
        icon: 'fas fa-user-injured',
        color: '#EC4899',
        trend: 18,
        trendLabel: 'nouveaux',
        description: 'Patients total'
      },
      {
        title: 'Rendez-vous',
        value: 328,
        icon: 'fas fa-calendar-check',
        color: '#06B6D4',
        trend: -5,
        trendLabel: 'vs semaine dernière',
        description: 'Ce mois'
      }
    ];
  }

  loadRecentCabinets() {
    // Données mockées
    this.recentCabinets = [
      {
        id: 1,
        name: 'Clinique Santé Plus',
        medecins: 5,
        secretaires: 2,
        patients: 320,
        status: 'active',
        revenue: 45000
      },
      {
        id: 2,
        name: 'Centre Médical du Nord',
        medecins: 3,
        secretaires: 1,
        patients: 180,
        status: 'active',
        revenue: 28000
      },
      {
        id: 3,
        name: 'Polyclinique Sud',
        medecins: 4,
        secretaires: 2,
        patients: 240,
        status: 'active',
        revenue: 36000
      },
      {
        id: 4,
        name: 'Cabinet Dentaire Est',
        medecins: 2,
        secretaires: 1,
        patients: 120,
        status: 'active',
        revenue: 22000
      }
    ];
  }

  loadRecentActivities() {
    // Données mockées
    this.recentActivities = [
      {
        id: 1,
        type: 'cabinet',
        title: 'Nouveau cabinet créé',
        description: 'Clinique Santé Plus a été créé',
        time: 'Il y a 2 heures',
        user: 'Dr. Martin',
        status: 'completed'
      },
      {
        id: 2,
        type: 'user',
        title: 'Nouveau médecin ajouté',
        description: 'Dr. Sophie Lambert ajoutée au cabinet Nord',
        time: 'Il y a 4 heures',
        user: 'Admin Cabinet',
        status: 'completed'
      },
      {
        id: 3,
        type: 'appointment',
        title: 'Rendez-vous annulé',
        description: 'Consultation urgente annulée',
        time: 'Il y a 6 heures',
        user: 'Mme. Dupont',
        status: 'cancelled'
      },
      {
        id: 4,
        type: 'payment',
        title: 'Paiement reçu',
        description: 'Facture #INV-2024-001 payée',
        time: 'Il y a 1 jour',
        user: 'Cabinet Sud',
        status: 'completed'
      }
    ];
  }

  setupRealTimeUpdates() {
    // Simulation de mises à jour en temps réel
    setInterval(() => {
      this.updateRandomStats();
    }, 30000);
  }

  updateRandomStats() {
    const randomIndex = Math.floor(Math.random() * this.stats.length);
    const change = Math.floor(Math.random() * 10) - 3;
    this.stats[randomIndex].value += change;
    
    if (change > 0) {
      this.stats[randomIndex].trend = Math.abs(change);
    } else {
      this.stats[randomIndex].trend = -Math.abs(change);
    }
  }

  // Gestion du formulaire de cabinet
  toggleCabinetForm() {
    this.showCabinetForm = !this.showCabinetForm;
    if (!this.showCabinetForm) {
      this.resetCabinetForm();
    }
  }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCabinet.logo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.newCabinet.logo = '';
  }

  validateCabinetForm(): boolean {
    this.errorMessage = '';
    
    if (!this.newCabinet.nomCabinet.trim()) {
      this.errorMessage = 'Le nom du cabinet est requis';
      return false;
    }

    if (!this.newCabinet.adresseCabinet.trim()) {
      this.errorMessage = 'L\'adresse du cabinet est requise';
      return false;
    }

    if (!this.newCabinet.emailCabinet.trim()) {
      this.errorMessage = 'L\'email du cabinet est requis';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newCabinet.emailCabinet)) {
      this.errorMessage = 'Veuillez entrer un email valide';
      return false;
    }

    if (!this.newCabinet.teleCabinet.trim()) {
      this.errorMessage = 'Le téléphone du cabinet est requis';
      return false;
    }

    return true;
  }

  async createCabinet() {
    if (!this.validateCabinetForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer le cabinet
      const newCabinetSummary: CabinetSummary = {
        id: this.recentCabinets.length + 1,
        name: this.newCabinet.nomCabinet,
        medecins: 0,
        secretaires: 0,
        patients: 0,
        status: 'active',
        revenue: 0
      };

      // Ajouter aux cabinets récents
      this.recentCabinets.unshift(newCabinetSummary);
      
      // Ajouter une activité
      const newActivity: RecentActivity = {
        id: this.recentActivities.length + 1,
        type: 'cabinet',
        title: 'Nouveau cabinet créé',
        description: `${this.newCabinet.nomCabinet} a été créé avec succès`,
        time: 'À l\'instant',
        user: this.adminName,
        status: 'completed'
      };
      this.recentActivities.unshift(newActivity);
      
      // Mettre à jour les statistiques
      this.stats[0].value += 1; // Incrémenter le nombre de cabinets
      this.stats[0].trend = 5; // Mettre à jour la tendance
      
      // Réinitialiser le formulaire
      this.resetCabinetForm();
      this.showCabinetForm = false;
      
      // Afficher un message de succès
      console.log('Cabinet créé avec succès:', this.newCabinet);
      
    } catch (error) {
      this.errorMessage = 'Erreur lors de la création du cabinet';
      console.error('Erreur:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  resetCabinetForm() {
    this.newCabinet = {
      nomCabinet: '',
      adresseCabinet: '',
      emailCabinet: '',
      teleCabinet: '',
      logo: ''
    };
    this.errorMessage = '';
  }

  // Navigation
  goToCabinets() {
    this.router.navigate(['/admin/cabinets']);
  }

  goToMedecins() {
    this.router.navigate(['/admin/medecins']);
  }

  goToSecretaires() {
    this.router.navigate(['/admin/secretaires']);
  }

  goToReports() {
    this.router.navigate(['/admin/reports']);
  }

  // Méthode manquante pour aller au détail d'un cabinet
  goToCabinetDetail(cabinetId: number) {
    this.router.navigate(['/admin/cabinets', cabinetId]);
  }

  // Actions rapides
  createNewCabinet() {
    this.showCabinetForm = true;
  }

  generateReport() {
    this.router.navigate(['/admin/reports/generate']);
  }

  viewAllActivities() {
    this.router.navigate(['/admin/activities']);
  }

  // Utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'user': return 'fas fa-user-plus';
      case 'cabinet': return 'fas fa-clinic-medical';
      case 'appointment': return 'fas fa-calendar-times';
      case 'payment': return 'fas fa-euro-sign';
      default: return 'fas fa-bell';
    }
  }

  getActivityColor(type: string): string {
    switch(type) {
      case 'user': return '#10B981';
      case 'cabinet': return '#0ea5e9';
      case 'appointment': return '#EF4444';
      case 'payment': return '#F59E0B';
      default: return '#6B7280';
    }
  }
}