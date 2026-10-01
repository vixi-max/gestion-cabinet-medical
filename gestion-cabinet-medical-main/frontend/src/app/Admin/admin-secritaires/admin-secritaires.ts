import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Secretaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateEmbauche: Date;
  status: 'actif' | 'inactif' | 'congé';
  cabinet: string;
  rendezVousAssignes: number;
  heuresTravail: number;
  performance: number;
  specialite: string;
  avatarColor: string;
}

@Component({
  selector: 'app-admin-secritaires',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-secritaires.html',
  styleUrls: ['./admin-secritaires.scss']
})
export class AdminSecritaires implements OnInit {
  // Données des secrétaires
  secretaires: Secretaire[] = [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.dupont@clinique.fr',
      telephone: '+33 6 12 34 56 78',
      dateEmbauche: new Date('2022-03-15'),
      status: 'actif',
      cabinet: 'Cabinet Principal',
      rendezVousAssignes: 156,
      heuresTravail: 35,
      performance: 92,
      specialite: 'Gestion Administrative',
      avatarColor: '#3B82F6'
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@clinique.fr',
      telephone: '+33 6 23 45 67 89',
      dateEmbauche: new Date('2021-08-10'),
      status: 'actif',
      cabinet: 'Cabinet Nord',
      rendezVousAssignes: 189,
      heuresTravail: 40,
      performance: 95,
      specialite: 'Accueil Patients',
      avatarColor: '#8B5CF6'
    },
    {
      id: 3,
      nom: 'Bernard',
      prenom: 'Julie',
      email: 'julie.bernard@clinique.fr',
      telephone: '+33 6 34 56 78 90',
      dateEmbauche: new Date('2023-01-20'),
      status: 'congé',
      cabinet: 'Cabinet Sud',
      rendezVousAssignes: 89,
      heuresTravail: 28,
      performance: 85,
      specialite: 'Planification',
      avatarColor: '#EC4899'
    },
    {
      id: 4,
      nom: 'Petit',
      prenom: 'Claire',
      email: 'claire.petit@clinique.fr',
      telephone: '+33 6 45 67 89 01',
      dateEmbauche: new Date('2020-11-05'),
      status: 'actif',
      cabinet: 'Cabinet Principal',
      rendezVousAssignes: 210,
      heuresTravail: 42,
      performance: 98,
      specialite: 'Gestion Administrative',
      avatarColor: '#10B981'
    },
    {
      id: 5,
      nom: 'Robert',
      prenom: 'Laura',
      email: 'laura.robert@clinique.fr',
      telephone: '+33 6 56 78 90 12',
      dateEmbauche: new Date('2023-05-30'),
      status: 'inactif',
      cabinet: 'Cabinet Ouest',
      rendezVousAssignes: 45,
      heuresTravail: 20,
      performance: 78,
      specialite: 'Accueil Patients',
      avatarColor: '#F59E0B'
    }
  ];

  // Statistiques
  stats = {
    total: 0,
    actifs: 0,
    performanceMoyenne: 0,
    totalRendezVous: 0,
    totalHeures: 0,
    cabinetsActifs: 0
  };

  // Filtres
  searchTerm: string = '';
  statusFilter: string = 'all';
  cabinetFilter: string = 'all';
  specialiteFilter: string = 'all';

  // Tri
  sortColumn: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;

  // Données pour les filtres
  cabinets: string[] = [];
  specialites: string[] = [];

  // Données calculées pour la répartition des spécialités
  specialiteRepartition: { nom: string; count: number; percentage: number }[] = [];

  ngOnInit() {
    this.calculerStatistiques();
    this.extraireFiltres();
    this.calculerRepartitionSpecialites();
  }

  calculerStatistiques() {
    const secretairesActifs = this.secretaires.filter(s => s.status === 'actif');
    const cabinetsUniques = [...new Set(this.secretaires.map(s => s.cabinet))];
    
    this.stats = {
      total: this.secretaires.length,
      actifs: secretairesActifs.length,
      performanceMoyenne: this.secretaires.length > 0 
        ? Math.round(this.secretaires.reduce((sum, s) => sum + s.performance, 0) / this.secretaires.length)
        : 0,
      totalRendezVous: this.secretaires.reduce((sum, s) => sum + s.rendezVousAssignes, 0),
      totalHeures: this.secretaires.reduce((sum, s) => sum + s.heuresTravail, 0),
      cabinetsActifs: cabinetsUniques.length
    };
  }

  extraireFiltres() {
    this.cabinets = [...new Set(this.secretaires.map(s => s.cabinet))].sort();
    this.specialites = [...new Set(this.secretaires.map(s => s.specialite))].sort();
  }

  calculerRepartitionSpecialites() {
    this.specialiteRepartition = this.specialites.map(specialite => {
      const count = this.secretaires.filter(s => s.specialite === specialite).length;
      const percentage = (count / this.secretaires.length) * 100;
      return { nom: specialite, count, percentage };
    });
  }

  // Getters pour les données filtrées et triées
  get filteredSecretaires(): Secretaire[] {
    return this.secretaires
      .filter(secretaire => {
        const matchesSearch = !this.searchTerm || 
          secretaire.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          secretaire.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          secretaire.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          secretaire.telephone.includes(this.searchTerm);

        const matchesStatus = this.statusFilter === 'all' || 
          secretaire.status === this.statusFilter;
        
        const matchesCabinet = this.cabinetFilter === 'all' || 
          secretaire.cabinet === this.cabinetFilter;
        
        const matchesSpecialite = this.specialiteFilter === 'all' || 
          secretaire.specialite === this.specialiteFilter;

        return matchesSearch && matchesStatus && matchesCabinet && matchesSpecialite;
      })
      .sort((a, b) => {
        const aValue = a[this.sortColumn as keyof Secretaire];
        const bValue = b[this.sortColumn as keyof Secretaire];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return this.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return this.sortDirection === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return this.sortDirection === 'asc' 
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }
        
        return 0;
      });
  }

  get paginatedSecretaires(): Secretaire[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSecretaires.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSecretaires.length / this.itemsPerPage);
  }

  // Méthodes utilitaires pour le template
  getMin(currentPage: number, itemsPerPage: number, filteredSecretaires: Secretaire[]): number {
    return Math.min(currentPage * itemsPerPage, filteredSecretaires.length);
  }

  // Méthodes pour le tri
  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // Méthodes pour la pagination
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthodes d'actions
  toggleStatus(secretaire: Secretaire) {
    secretaire.status = secretaire.status === 'actif' ? 'inactif' : 'actif';
    this.calculerStatistiques();
  }

  editSecretaire(secretaire: Secretaire) {
    console.log('Modifier secrétaire:', secretaire);
    // Implémenter la logique d'édition
  }

  deleteSecretaire(secretaire: Secretaire) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${secretaire.prenom} ${secretaire.nom} ?`)) {
      this.secretaires = this.secretaires.filter(s => s.id !== secretaire.id);
      this.calculerStatistiques();
      this.extraireFiltres();
      this.calculerRepartitionSpecialites();
    }
  }

  // Méthodes utilitaires
  getInitiales(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getDateFormatee(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getAnciennete(dateEmbauche: Date): number {
    const aujourdhui = new Date();
    const embauche = new Date(dateEmbauche);
    return Math.floor((aujourdhui.getTime() - embauche.getTime()) / (1000 * 3600 * 24 * 365));
  }

  // Réinitialiser les filtres
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.cabinetFilter = 'all';
    this.specialiteFilter = 'all';
    this.currentPage = 1;
  }

  // Générer un rapport
  genererRapport() {
    console.log('Génération du rapport...');
    // Implémenter la génération de rapport
  }
}