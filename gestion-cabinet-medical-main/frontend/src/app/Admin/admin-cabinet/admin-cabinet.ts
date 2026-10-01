import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabinetService, Cabinet, CabinetFormData, CabinetStats, CabinetFilter, PaginatedResponse } from '../../services/cabinet';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-cabinet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-cabinet.html',
  styleUrls: ['./admin-cabinet.scss']
})
export class AdminCabinet implements OnInit, OnDestroy {
  // États du composant
  cabinets: Cabinet[] = [];
  filteredCabinets: Cabinet[] = [];
  paginatedCabinets: Cabinet[] = [];
  stats: CabinetStats = { total: 0, actifs: 0, inactifs: 0, suspendus: 0 };
  
  // Données du formulaire
  newCabinet: any = {
    id: undefined as number | undefined,
    nomCabinet: '',
    adresseCabinet: '',
    emailCabinet: '',
    teleCabinet: '',
    statut: 'ACTIF' as 'ACTIF' | 'INACTIF' | 'SUSPENDU'
  };
  
  // Variables d'état UI
  showAddForm = false;
  isEditMode = false;
  isSubmitting = false;
  isLoading = false;
  logoPreview: string | null = null;
  logoFile: File | null = null;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  
  // Filtres et pagination
  searchTerm = '';
  filterStatus: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'ALL' = 'ALL';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Souscriptions
  private subscriptions: Subscription = new Subscription();

  constructor(private cabinetService: CabinetService) {}

  ngOnInit(): void {
    this.loadCabinets();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Charger tous les cabinets
  loadCabinets(): void {
    this.isLoading = true;
    const sub = this.cabinetService.getAllCabinets().subscribe({
      next: (cabinets: Cabinet[]) => {
        this.cabinets = cabinets;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des cabinets:', error);
        this.errorMessage = 'Erreur lors du chargement des cabinets';
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  // Charger les statistiques
  loadStats(): void {
    const sub = this.cabinetService.getCabinetStats().subscribe({
      next: (stats: CabinetStats) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  // Recherche avec pagination
  searchCabinets(): void {
    const filter: CabinetFilter = {
      searchTerm: this.searchTerm,
      statut: this.filterStatus !== 'ALL' ? this.filterStatus : undefined,
      page: this.currentPage,
      itemsPerPage: this.itemsPerPage
    };

    this.isLoading = true;
    const sub = this.cabinetService.searchCabinets(filter).subscribe({
      next: (response: PaginatedResponse<Cabinet>) => {
        this.filteredCabinets = response.items;
        this.paginatedCabinets = response.items;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la recherche:', error);
        this.errorMessage = 'Erreur lors de la recherche';
        this.isLoading = false;
        // Fallback aux données locales
        this.applyFilters();
      }
    });
    this.subscriptions.add(sub);
  }

  // Appliquer les filtres localement
  applyFilters(): void {
    let filtered = [...this.cabinets];
    
    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cabinet =>
        cabinet.nomCabinet.toLowerCase().includes(term) ||
        cabinet.adresseCabinet.toLowerCase().includes(term) ||
        cabinet.emailCabinet.toLowerCase().includes(term) ||
        cabinet.teleCabinet.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par statut
    if (this.filterStatus && this.filterStatus !== 'ALL') {
      filtered = filtered.filter(cabinet => cabinet.statut === this.filterStatus);
    }
    
    this.filteredCabinets = filtered;
    this.updatePagination();
  }

  // Mettre à jour la pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCabinets.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCabinets = this.filteredCabinets.slice(startIndex, endIndex);
  }

  // Gestion de la pagination
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  changeItemsPerPage(items: number): void {
    this.itemsPerPage = items;
    this.currentPage = 1;
    this.updatePagination();
  }

  // Recherche
  onSearch(): void {
    this.currentPage = 1;
    // Utiliser la recherche avec pagination si disponible, sinon appliquer localement
    if (this.searchTerm || this.filterStatus !== 'ALL') {
      this.searchCabinets();
    } else {
      this.applyFilters();
    }
  }

  // Gestion du formulaire
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  // Ajouter ou modifier un cabinet
  addCabinet(): void {
    if (this.isSubmitting) return;
    
    // Validation
    if (!this.newCabinet.nomCabinet || !this.newCabinet.adresseCabinet || 
        !this.newCabinet.emailCabinet || !this.newCabinet.teleCabinet) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    // Préparer les données
    const cabinetData: CabinetFormData = {
      ...this.newCabinet,
      logo: this.logoFile || undefined
    };
    
    let operation$;
    
    if (this.isEditMode && this.newCabinet.id) {
      // Mode édition
      operation$ = this.cabinetService.updateCabinet(this.newCabinet.id, cabinetData);
    } else {
      // Mode création
      operation$ = this.cabinetService.createCabinet(cabinetData);
    }
    
    const sub = operation$.subscribe({
      next: (cabinet: Cabinet) => {
        this.successMessage = this.isEditMode 
          ? 'Cabinet modifié avec succès' 
          : 'Cabinet créé avec succès';
        
        // Recharger les données
        this.loadCabinets();
        this.loadStats();
        
        // Réinitialiser le formulaire
        this.resetForm();
        this.showAddForm = false;
        this.isSubmitting = false;
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'opération:', error);
        this.errorMessage = error.error?.message || 'Une erreur est survenue';
        this.isSubmitting = false;
      }
    });
    
    this.subscriptions.add(sub);
  }
  // Méthode pour calculer la valeur maximale dans le template
getMaxDisplayCount(): number {
  const max = this.currentPage * this.itemsPerPage;
  const total = this.filteredCabinets.length;
  return Math.min(max, total);
}
// Méthode pour réinitialiser les filtres
resetFilters(): void {
  this.searchTerm = '';
  this.filterStatus = 'ALL';
  this.currentPage = 1;
  this.itemsPerPage = 10;
  this.applyFilters();
}

// Méthode pour afficher les détails d'un cabinet
viewCabinet(cabinet: Cabinet): void {
  // Vous pouvez implémenter la logique pour afficher les détails
  console.log('Voir les détails du cabinet:', cabinet);
  // Par exemple, ouvrir un modal ou naviguer vers une page détail
}


  // Éditer un cabinet
  editCabinet(cabinet: Cabinet): void {
    this.isEditMode = true;
    this.showAddForm = true;
    
    // Copier les données du cabinet
    this.newCabinet = {
      id: cabinet.id,
      nomCabinet: cabinet.nomCabinet,
      adresseCabinet: cabinet.adresseCabinet,
      emailCabinet: cabinet.emailCabinet,
      teleCabinet: cabinet.teleCabinet,
      statut: cabinet.statut || 'ACTIF'
    };
    
    // Prévisualiser le logo si disponible
    if (cabinet.logo) {
      this.logoPreview = cabinet.logo;
    }
    
    // Faire défiler vers le formulaire
    setTimeout(() => {
      const formElement = document.getElementById('cabinet-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // Supprimer un cabinet
  deleteCabinet(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cabinet ?')) {
      const sub = this.cabinetService.deleteCabinet(id).subscribe({
        next: () => {
          this.successMessage = 'Cabinet supprimé avec succès';
          
          // Recharger les données
          this.loadCabinets();
          this.loadStats();
          
          // Masquer le message après 3 secondes
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
        }
      });
      this.subscriptions.add(sub);
    }
  }

  // Gestion du fichier logo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier est trop volumineux (max 5MB)';
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        this.errorMessage = 'Format de fichier non supporté. Utilisez JPG, PNG ou GIF.';
        return;
      }
      
      this.logoFile = file;
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.logoFile = null;
    
    // Si en mode édition et qu'un logo existait, le supprimer du serveur
    if (this.isEditMode && this.newCabinet.id) {
      const sub = this.cabinetService.deleteLogo(this.newCabinet.id).subscribe({
        next: () => {
          console.log('Logo supprimé du serveur');
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression du logo:', error);
        }
      });
      this.subscriptions.add(sub);
    }
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.newCabinet = {
      id: undefined,
      nomCabinet: '',
      adresseCabinet: '',
      emailCabinet: '',
      teleCabinet: '',
      statut: 'ACTIF'
    };
    this.logoPreview = null;
    this.logoFile = null;
    this.isEditMode = false;
    this.errorMessage = '';
  }

  // Utilitaires pour l'affichage
  getStatusClass(statut?: string): string {
    switch (statut) {
      case 'ACTIF': return 'badge bg-success';
      case 'INACTIF': return 'badge bg-secondary';
      case 'SUSPENDU': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(statut?: string): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'INACTIF': return 'Inactif';
      case 'SUSPENDU': return 'Suspendu';
      default: return 'Inconnu';
    }
  }
}