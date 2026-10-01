import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Medecin {
  idMedecin: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  dateEmbauche: Date;
  statut: 'actif' | 'inactif' | 'congé';
  avatar?: string;
  cabinetId: number;
  cabinetNom: string;
}

export interface Cabinet {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'en attente';
  medecinsCount: number;
  rendezVousCount: number;
  revenuMensuel: number;
}

@Component({
  selector: 'app-admin-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-medecins.html',
  styleUrls: ['./admin-medecins.scss']
})
export class AdminMedecins implements OnInit {
  // Propriété pour le tri
sortBy: string = 'nom';
sortDirection: 'asc' | 'desc' = 'asc';
  // Données de démonstration
  cabinets: Cabinet[] = [
    {
      id: 1,
      nom: 'Cabinet Médical Central',
      adresse: '123 Avenue des Champs-Élysées',
      ville: 'Paris',
      telephone: '01 23 45 67 89',
      email: 'contact@cabinet-central.fr',
      statut: 'actif',
      medecinsCount: 8,
      rendezVousCount: 145,
      revenuMensuel: 45000
    },
    {
      id: 2,
      nom: 'Polyclinique du Nord',
      adresse: '456 Rue de la République',
      ville: 'Lille',
      telephone: '03 20 12 34 56',
      email: 'info@polyclinique-nord.fr',
      statut: 'actif',
      medecinsCount: 12,
      rendezVousCount: 230,
      revenuMensuel: 68000
    },
    {
      id: 3,
      nom: 'Centre Médical Sud',
      adresse: '789 Boulevard de la Liberté',
      ville: 'Marseille',
      telephone: '04 91 23 45 67',
      email: 'accueil@centre-sud.fr',
      statut: 'en attente',
      medecinsCount: 6,
      rendezVousCount: 89,
      revenuMensuel: 32000
    },
    {
      id: 4,
      nom: 'Clinique Saint-Louis',
      adresse: '321 Rue du Faubourg Saint-Honoré',
      ville: 'Lyon',
      telephone: '04 78 12 34 56',
      email: 'contact@clinique-stlouis.fr',
      statut: 'actif',
      medecinsCount: 15,
      rendezVousCount: 310,
      revenuMensuel: 92000
    }
  ];

  medecins: Medecin[] = [
    {
      idMedecin: 1,
      nom: 'Martin',
      prenom: 'Sophie',
      specialite: 'Cardiologie',
      email: 's.martin@cabinet-central.fr',
      telephone: '01 23 45 67 90',
      matricule: 'MED123456',
      dateEmbauche: new Date('2020-03-15'),
      statut: 'actif',
      avatar: 'SM',
      cabinetId: 1,
      cabinetNom: 'Cabinet Médical Central'
    },
    {
      idMedecin: 2,
      nom: 'Dubois',
      prenom: 'Pierre',
      specialite: 'Pédiatrie',
      email: 'p.dubois@cabinet-central.fr',
      telephone: '01 23 45 67 91',
      matricule: 'MED123457',
      dateEmbauche: new Date('2019-11-20'),
      statut: 'actif',
      avatar: 'PD',
      cabinetId: 1,
      cabinetNom: 'Cabinet Médical Central'
    },
    {
      idMedecin: 3,
      nom: 'Leroy',
      prenom: 'Marie',
      specialite: 'Dermatologie',
      email: 'm.leroy@polyclinique-nord.fr',
      telephone: '03 20 12 34 57',
      matricule: 'MED123458',
      dateEmbauche: new Date('2021-06-10'),
      statut: 'actif',
      avatar: 'ML',
      cabinetId: 2,
      cabinetNom: 'Polyclinique du Nord'
    },
    {
      idMedecin: 4,
      nom: 'Moreau',
      prenom: 'Thomas',
      specialite: 'Chirurgie',
      email: 't.moreau@polyclinique-nord.fr',
      telephone: '03 20 12 34 58',
      matricule: 'MED123459',
      dateEmbauche: new Date('2018-09-05'),
      statut: 'congé',
      avatar: 'TM',
      cabinetId: 2,
      cabinetNom: 'Polyclinique du Nord'
    },
    {
      idMedecin: 5,
      nom: 'Simon',
      prenom: 'Julie',
      specialite: 'Gynécologie',
      email: 'j.simon@centre-sud.fr',
      telephone: '04 91 23 45 68',
      matricule: 'MED123460',
      dateEmbauche: new Date('2022-01-15'),
      statut: 'actif',
      avatar: 'JS',
      cabinetId: 3,
      cabinetNom: 'Centre Médical Sud'
    },
    {
      idMedecin: 6,
      nom: 'Laurent',
      prenom: 'Jean',
      specialite: 'Orthopédie',
      email: 'j.laurent@clinique-stlouis.fr',
      telephone: '04 78 12 34 57',
      matricule: 'MED123461',
      dateEmbauche: new Date('2017-04-30'),
      statut: 'actif',
      avatar: 'JL',
      cabinetId: 4,
      cabinetNom: 'Clinique Saint-Louis'
    },
    {
      idMedecin: 7,
      nom: 'Michel',
      prenom: 'Catherine',
      specialite: 'Neurologie',
      email: 'c.michel@clinique-stlouis.fr',
      telephone: '04 78 12 34 58',
      matricule: 'MED123462',
      dateEmbauche: new Date('2020-08-22'),
      statut: 'inactif',
      avatar: 'CM',
      cabinetId: 4,
      cabinetNom: 'Clinique Saint-Louis'
    },
    {
      idMedecin: 8,
      nom: 'Bernard',
      prenom: 'François',
      specialite: 'Ophtalmologie',
      email: 'f.bernard@cabinet-central.fr',
      telephone: '01 23 45 67 92',
      matricule: 'MED123463',
      dateEmbauche: new Date('2021-12-01'),
      statut: 'actif',
      avatar: 'FB',
      cabinetId: 1,
      cabinetNom: 'Cabinet Médical Central'
    }
  ];

  // Filtres et recherche
  searchQuery: string = '';
  selectedCabinet: number = 0; // 0 = Tous les cabinets
  selectedSpecialite: string = 'tous';
  selectedStatut: string = 'tous';
  
  // Formulaire d'ajout
  showAddForm: boolean = false;
  newMedecin: Medecin = {
    idMedecin: 0,
    nom: '',
    prenom: '',
    specialite: '',
    email: '',
    telephone: '',
    matricule: '',
    dateEmbauche: new Date(),
    statut: 'actif',
    cabinetId: 1,
    cabinetNom: ''
  };

  // Statistiques
  totalMedecins: number = 0;
  medecinsActifs: number = 0;
  medecinsEnConge: number = 0;
  medecinsInactifs: number = 0;

  // Spécialités disponibles
  specialites: string[] = [
    'Cardiologie',
    'Pédiatrie',
    'Dermatologie',
    'Chirurgie',
    'Gynécologie',
    'Orthopédie',
    'Neurologie',
    'Ophtalmologie',
    'Radiologie',
    'Psychiatrie',
    'Médecine générale'
  ];

  currentDate: string = '';

  ngOnInit() {
    this.calculerStatistiques();
    this.updateCurrentDate();
  }

  // Méthode pour calculer les statistiques
  calculerStatistiques() {
    this.totalMedecins = this.medecins.length;
    this.medecinsActifs = this.medecins.filter(m => m.statut === 'actif').length;
    this.medecinsEnConge = this.medecins.filter(m => m.statut === 'congé').length;
    this.medecinsInactifs = this.medecins.filter(m => m.statut === 'inactif').length;
  }

  // Méthode pour filtrer les médecins
  get filteredMedecins(): Medecin[] {
    return this.medecins.filter(medecin => {
      // Filtre par recherche
      const matchesSearch = !this.searchQuery || 
        medecin.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        medecin.prenom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        medecin.specialite.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        medecin.matricule.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtre par cabinet
      const matchesCabinet = this.selectedCabinet === 0 || medecin.cabinetId === this.selectedCabinet;

      // Filtre par spécialité
      const matchesSpecialite = this.selectedSpecialite === 'tous' || medecin.specialite === this.selectedSpecialite;

      // Filtre par statut
      const matchesStatut = this.selectedStatut === 'tous' || medecin.statut === this.selectedStatut;

      return matchesSearch && matchesCabinet && matchesSpecialite && matchesStatut;
    });
  }

  // Méthode pour obtenir les médecins d'un cabinet spécifique
  getMedecinsByCabinet(cabinetId: number): Medecin[] {
    return this.medecins.filter(m => m.cabinetId === cabinetId);
  }

  // Méthode pour obtenir le nombre de médecins par spécialité
  getMedecinsCountBySpecialite(specialite: string): number {
    return this.medecins.filter(m => m.specialite === specialite).length;
  }

  // Méthode pour ajouter un nouveau médecin
  ajouterMedecin() {
    if (this.validerFormulaire()) {
      // Générer un ID unique
      const maxId = Math.max(...this.medecins.map(m => m.idMedecin));
      this.newMedecin.idMedecin = maxId + 1;
      
      // Trouver le nom du cabinet
      const cabinet = this.cabinets.find(c => c.id === this.newMedecin.cabinetId);
      if (cabinet) {
        this.newMedecin.cabinetNom = cabinet.nom;
      }

      // Générer avatar
      this.newMedecin.avatar = this.newMedecin.prenom[0] + this.newMedecin.nom[0];

      // Ajouter le médecin
      this.medecins.push({...this.newMedecin});
      
      // Réinitialiser le formulaire
      this.resetForm();
      this.showAddForm = false;
      
      // Recalculer les statistiques
      this.calculerStatistiques();
    }
  }

  // Méthode pour valider le formulaire
  validerFormulaire(): boolean {
    return !!(this.newMedecin.nom && 
      this.newMedecin.prenom && 
      this.newMedecin.specialite && 
      this.newMedecin.email && 
      this.newMedecin.telephone && 
      this.newMedecin.matricule);
  }

  // Méthode pour réinitialiser le formulaire
  resetForm() {
    this.newMedecin = {
      idMedecin: 0,
      nom: '',
      prenom: '',
      specialite: '',
      email: '',
      telephone: '',
      matricule: '',
      dateEmbauche: new Date(),
      statut: 'actif',
      cabinetId: 1,
      cabinetNom: ''
    };
  }

  // Méthode pour formater la date
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Méthode pour mettre à jour la date courante
  updateCurrentDate() {
    this.currentDate = this.formatDate(new Date());
  }

  // Méthode pour obtenir la couleur du statut
  getStatutColor(statut: string): string {
    switch(statut) {
      case 'actif': return '#10B981';
      case 'inactif': return '#EF4444';
      case 'congé': return '#F59E0B';
      default: return '#94A3B8';
    }
  }

  // Méthode pour obtenir la couleur de fond du statut
  getStatutBackgroundColor(statut: string): string {
    const color = this.getStatutColor(statut);
    // Convertir hex en rgba avec opacité
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  }

  // Méthode pour obtenir la couleur du statut du cabinet
  getCabinetStatutColor(statut: string): string {
    switch(statut) {
      case 'actif': return '#10B981';
      case 'inactif': return '#EF4444';
      case 'en attente': return '#F59E0B';
      default: return '#94A3B8';
    }
  }

  // Méthode pour changer le statut d'un médecin
  toggleStatut(medecin: Medecin) {
    const statuts: ('actif' | 'inactif' | 'congé')[] = ['actif', 'inactif', 'congé'];
    const currentIndex = statuts.indexOf(medecin.statut);
    medecin.statut = statuts[(currentIndex + 1) % statuts.length];
    this.calculerStatistiques();
  }

  // Méthode pour supprimer un médecin
  supprimerMedecin(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      this.medecins = this.medecins.filter(m => m.idMedecin !== id);
      this.calculerStatistiques();
    }
  }

  // Méthode pour réinitialiser les filtres
  resetFilters() {
    this.searchQuery = '';
    this.selectedCabinet = 0;
    this.selectedSpecialite = 'tous';
    this.selectedStatut = 'tous';
  }
  // Méthode pour trier
toggleSort(field: string) {
  if (this.sortBy === field) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortBy = field;
    this.sortDirection = 'asc';
  }
}

// Méthode pour exporter
exportToExcel() {
  alert('Fonction d\'export Excel à implémenter');
  // Implémentez l'export Excel ici
}

// Méthode pour imprimer
printList() {
  window.print();
}

// Méthode pour modifier un médecin
editMedecin(medecin: Medecin) {
  // Implémentez la modification ici
  alert(`Modification du médecin: ${medecin.nom} ${medecin.prenom}`);
}
}