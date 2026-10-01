import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderSec } from '../header-sec/header-sec';
import { RendezVousService, RendezVousRequest, RendezVousDetailsResponse, PatientInfo } from '../../services/rendez-vous';
import { PatientService, PatientResponse } from '../../services/patient';
import { AuthService } from '../../services/auth';
import { UserService, UserResponse } from '../../services/user';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interfaces
export interface Patient {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  numTel: string;
  typeMutuelle: string;
}

export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  numTel: string;
}

export interface RendezVous {
  id: number;
  patientId: number;
  medecinId: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  typeConsultation: string;
  motif: string;
  notes: string;
  statut: 'planifie' | 'confirme' | 'annule' | 'termine';
  createdAt: string;
}

@Component({
  selector: 'app-prendre-rdv',
  imports: [FormsModule, CommonModule,],
  templateUrl: './prend-rdv.html',
  styleUrl: './prend-rdv.scss'
})
export class PrendreRDVComponent implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  searchTerm: string = '';
  showAddForm: boolean = false;
  isEditing: boolean = false;
  viewMode: 'list' | 'calendar' | 'grid' = 'list';
  hasConflict: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  private subscriptions: Subscription = new Subscription();
  
  // Filtres
  filterDate: string = '';
  filterMedecin: string = '';
  filterStatut: string = '';

  // Données minimales pour la date
  minDate: string = new Date().toISOString().split('T')[0];

  // Heures disponibles
  heuresDisponibles: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Données des médecins
  medecins: Medecin[] = [];

  // Données des patients
  patients: Patient[] = [];

  // Nouveau rendez-vous
  newRendezVous: RendezVous = {
    id: 0,
    patientId: 0,
    medecinId: 0,
    date: '',
    heureDebut: '',
    heureFin: '',
    duree: 30,
    typeConsultation: '',
    motif: '',
    notes: '',
    statut: 'planifie',
    createdAt: new Date().toISOString()
  };

  // Liste des rendez-vous
  rendezVous: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];

  // Patient sélectionné
  selectedPatient: Patient | null = null;

  // Calendrier
  currentWeek: Date = new Date();
  weekDays: { name: string; date: Date }[] = [];

  constructor(
    private rendezVousService: RendezVousService,
    private patientService: PatientService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadPatients();
    this.loadRendezVous(); // Les médecins seront chargés automatiquement depuis les rendez-vous
    this.generateWeekDays();
    
    // Mettre à jour l'heure chaque minute
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadPatients() {
    this.isLoading = true;
    const sub = this.patientService.getAllPatients().subscribe({
      next: (patientsResponse: PatientResponse[]) => {
        this.patients = patientsResponse.map(p => this.mapToPatient(p));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des patients:', error);
        this.errorMessage = 'Erreur lors du chargement des patients.';
        this.isLoading = false;
        this.patients = [];
      }
    });
    this.subscriptions.add(sub);
  }

  loadMedecins() {
    this.isLoading = true;
    const sub = this.userService.getAllMedecins().subscribe({
      next: (medecinsResponse: UserResponse[]) => {
        this.medecins = medecinsResponse.map(m => this.mapToMedecin(m));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des médecins:', error);
        this.errorMessage = 'Erreur lors du chargement des médecins.';
        this.isLoading = false;
        this.medecins = [];
      }
    });
    this.subscriptions.add(sub);
  }

  // Mapper UserResponse vers Medecin
  private mapToMedecin(userResponse: UserResponse): Medecin {
    return {
      id: userResponse.id,
      nom: userResponse.nom,
      prenom: userResponse.prenom,
      email: userResponse.email,
      numTel: userResponse.numTel,
      specialite: 'Médecine Générale' // Valeur par défaut, peut être enrichie plus tard
    };
  }

  loadRendezVous() {
    // Récupérer l'ID du secrétaire depuis les données utilisateur
    const userData = this.authService.getUserData();
    const idSecretaire = userData?.id || 0;

    if (!idSecretaire) {
      this.errorMessage = 'Impossible de récupérer les informations du secrétaire.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Utiliser la méthode détaillée pour récupérer les rendez-vous avec informations patient
    const sub = this.rendezVousService.getRendezVousDetailsBySecretaireId(idSecretaire).subscribe({
      next: (detailsResponse: RendezVousDetailsResponse[]) => {
        // Extraire les rendez-vous et les patients depuis la réponse détaillée
        const rdvsWithPatients: Array<{ rdv: any, patient: PatientInfo }> = [];
        const medecinIds = new Set<number>();
        
        detailsResponse.forEach(detail => {
          const patient = detail.consultationResponsesListe.patient;
          
          // Pour chaque rendez-vous dans la réponse
          detail.rendezVousResponse.forEach(rdv => {
            rdvsWithPatients.push({
              rdv: rdv,
              patient: patient
            });
            
            // Collecter les IDs des médecins
            if (rdv.idMedecin) {
              medecinIds.add(rdv.idMedecin);
            }
          });
        });

        // Mapper les rendez-vous avec les informations patient
        this.rendezVous = rdvsWithPatients.map(({ rdv, patient }) => {
          const mappedRdv = this.mapToRendezVous(rdv);
          
          // Mettre à jour ou ajouter le patient dans la liste si nécessaire
          const existingPatient = this.patients.find(p => p.id === patient.idPatient);
          if (!existingPatient) {
            this.patients.push(this.mapPatientInfoToPatient(patient));
          }
          
          return mappedRdv;
        });
        
    this.filteredRendezVous = [...this.rendezVous];
        
        // Charger les médecins à partir des IDs collectés
        this.loadMedecinsByIds(Array.from(medecinIds));
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        this.errorMessage = 'Erreur lors du chargement des rendez-vous.';
        this.isLoading = false;
        this.rendezVous = [];
        this.filteredRendezVous = [];
      }
    });
    this.subscriptions.add(sub);
  }

  // Charger les médecins à partir de leurs IDs
  loadMedecinsByIds(medecinIds: number[]) {
    if (medecinIds.length === 0) {
      return;
    }

    // Créer un tableau d'observables pour récupérer chaque médecin
    const medecinRequests = medecinIds.map(id => 
      this.userService.getUserById(id).pipe(
        map(user => this.mapToMedecin(user)),
        catchError(error => {
          console.error(`Erreur lors de la récupération du médecin ${id}:`, error);
          return of(null); // Retourner null en cas d'erreur
        })
      )
    );

    // Exécuter toutes les requêtes en parallèle
    const sub = forkJoin(medecinRequests).subscribe({
      next: (medecins) => {
        // Filtrer les null et ajouter les médecins à la liste
        const validMedecins = medecins.filter(m => m !== null) as Medecin[];
        
        validMedecins.forEach(medecin => {
          // Vérifier si le médecin n'existe pas déjà
          const existingMedecin = this.medecins.find(m => m.id === medecin.id);
          if (!existingMedecin) {
            this.medecins.push(medecin);
          }
        });
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des médecins:', error);
      }
    });
    
    this.subscriptions.add(sub);
  }

  // Mapper PatientInfo vers Patient
  private mapPatientInfoToPatient(patientInfo: PatientInfo): Patient {
    return {
      id: patientInfo.idPatient,
      cin: patientInfo.cin,
      nom: patientInfo.nom,
      prenom: patientInfo.prenom,
      dateNaissance: patientInfo.dateNaissance,
      sexe: this.normalizeSexe(patientInfo.sexe),
      numTel: patientInfo.numTel || '',
      typeMutuelle: patientInfo.typeMutuelle || ''
    };
  }

  // Mapper PatientResponse vers Patient
  private mapToPatient(response: PatientResponse): Patient {
    return {
      id: response.idPatient,
      cin: response.cin,
      nom: response.nom,
      prenom: response.prenom,
      dateNaissance: response.dateNaissance,
      sexe: this.normalizeSexe(response.sexe),
      numTel: response.numTel || '',
      typeMutuelle: response.typeMutuelle || ''
    };
  }

  // Normaliser le sexe : HOMME -> M, FEMME -> F
  private normalizeSexe(sexe: string): string {
    if (sexe === 'HOMME' || sexe === 'M' || sexe === 'Masculin') return 'M';
    if (sexe === 'FEMME' || sexe === 'F' || sexe === 'Féminin') return 'F';
    return sexe;
  }

  // Mapper RendezVousResponse vers RendezVous
  private mapToRendezVous(response: any): RendezVous {
    // Gérer les dates qui peuvent être null (le service les convertit déjà en Date avec valeur par défaut)
    const dateRdvs = response.dateRdvs 
      ? (typeof response.dateRdvs === 'string' ? new Date(response.dateRdvs) : response.dateRdvs)
      : new Date();
    
    // Gérer les heures qui peuvent être null ou en format "HH:mm:ss"
    let heureDebut: Date;
    if (response.heureDebut) {
      if (typeof response.heureDebut === 'string') {
        heureDebut = this.parseTimeString(response.heureDebut);
      } else {
        heureDebut = response.heureDebut;
      }
    } else {
      // Valeur par défaut si null
      heureDebut = new Date();
      heureDebut.setHours(9, 0, 0, 0);
    }
    
    let heureFin: Date;
    if (response.heureFin) {
      if (typeof response.heureFin === 'string') {
        heureFin = this.parseTimeString(response.heureFin);
      } else {
        heureFin = response.heureFin;
      }
    } else {
      // Valeur par défaut si null
      heureFin = new Date();
      heureFin.setHours(9, 30, 0, 0);
    }

    return {
      id: response.idRendezVous,
      patientId: response.idPatient || 0,
      medecinId: response.idMedecin || 0,
      date: dateRdvs.toISOString().split('T')[0],
      heureDebut: this.formatTime(heureDebut),
      heureFin: this.formatTime(heureFin),
      duree: this.calculateDuree(heureDebut, heureFin),
      typeConsultation: response.motif || '',
      motif: response.motif || '',
      notes: response.remarque || '',
      statut: this.mapStatut(response.statut),
      createdAt: dateRdvs.toISOString()
    };
  }

  // Parser une chaîne de temps "HH:mm:ss" ou "HH:mm" en Date
  private parseTimeString(timeStr: string): Date {
    // Si c'est déjà une date complète avec T, l'utiliser directement
    if (timeStr.includes('T')) {
      return new Date(timeStr);
    }
    
    // Sinon, c'est juste l'heure "HH:mm:ss" ou "HH:mm"
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Formater l'heure en HH:mm
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Calculer la durée en minutes
  private calculateDuree(heureDebut: Date, heureFin: Date): number {
    return Math.round((heureFin.getTime() - heureDebut.getTime()) / (1000 * 60));
  }

  // Mapper le statut de l'API vers le format du composant
  private mapStatut(statut: string): 'planifie' | 'confirme' | 'annule' | 'termine' {
    const statutLower = statut.toLowerCase();
    if (statutLower.includes('planif') || statutLower.includes('disponible')) return 'planifie';
    if (statutLower.includes('confirm')) return 'confirme';
    if (statutLower.includes('annul')) return 'annule';
    if (statutLower.includes('termine') || statutLower.includes('complete')) return 'termine';
    return 'planifie';
  }

  // Méthodes utilitaires pour les dates
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  getDayAfterTomorrowDate(): string {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.rendezVous];

    // Filtre par recherche texte
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(rdv => 
        this.getPatientName(rdv.patientId).toLowerCase().includes(term) ||
        this.getMedecinName(rdv.medecinId).toLowerCase().includes(term) ||
        rdv.typeConsultation.toLowerCase().includes(term) ||
        rdv.motif.toLowerCase().includes(term)
      );
    }

    // Filtre par date
    if (this.filterDate) {
      filtered = filtered.filter(rdv => rdv.date === this.filterDate);
    }

    // Filtre par médecin
    if (this.filterMedecin) {
      filtered = filtered.filter(rdv => rdv.medecinId === parseInt(this.filterMedecin));
    }

    // Filtre par statut
    if (this.filterStatut) {
      filtered = filtered.filter(rdv => rdv.statut === this.filterStatut);
    }

    this.filteredRendezVous = filtered;
  }

  // Gestion des événements du formulaire
  onPatientChange() {
    this.selectedPatient = this.patients.find(p => p.id === this.newRendezVous.patientId) || null;
    this.checkConflict();
  }

  onDateChange() {
    this.checkConflict();
  }

  onHeureChange() {
    this.calculateHeureFin();
    this.checkConflict();
  }

  onDureeChange() {
    this.calculateHeureFin();
    this.checkConflict();
  }

  calculateHeureFin() {
    if (this.newRendezVous.heureDebut && this.newRendezVous.duree) {
      const [hours, minutes] = this.newRendezVous.heureDebut.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + this.newRendezVous.duree, 0, 0);
      
      const endHours = endTime.getHours().toString().padStart(2, '0');
      const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
      this.newRendezVous.heureFin = `${endHours}:${endMinutes}`;
    }
  }

  checkConflict() {
    if (!this.newRendezVous.date || !this.newRendezVous.heureDebut || !this.newRendezVous.medecinId) {
      this.hasConflict = false;
      return;
    }

    const conflict = this.rendezVous.some(rdv => 
      rdv.id !== this.newRendezVous.id &&
      rdv.medecinId === this.newRendezVous.medecinId &&
      rdv.date === this.newRendezVous.date &&
      rdv.statut !== 'annule' &&
      this.isTimeOverlap(rdv.heureDebut, rdv.heureFin, this.newRendezVous.heureDebut, this.newRendezVous.heureFin)
    );

    this.hasConflict = conflict;
  }

  isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const [start1Hour, start1Minute] = start1.split(':').map(Number);
    const [end1Hour, end1Minute] = end1.split(':').map(Number);
    const [start2Hour, start2Minute] = start2.split(':').map(Number);
    const [end2Hour, end2Minute] = end2.split(':').map(Number);

    const start1Total = start1Hour * 60 + start1Minute;
    const end1Total = end1Hour * 60 + end1Minute;
    const start2Total = start2Hour * 60 + start2Minute;
    const end2Total = end2Hour * 60 + end2Minute;

    return start1Total < end2Total && end1Total > start2Total;
  }

  // Soumission du formulaire
  onSubmit() {
    // Récupérer l'ID du secrétaire depuis les données utilisateur
    const userData = this.authService.getUserData();
    const idSecretaire = userData?.id || 0;

    if (!idSecretaire) {
      this.errorMessage = 'Impossible de récupérer les informations du secrétaire.';
      return;
    }

    // Construire la date complète pour heureDebut et heureFin
    const dateTimeDebut = new Date(`${this.newRendezVous.date}T${this.newRendezVous.heureDebut}:00`);
    const dateTimeFin = new Date(`${this.newRendezVous.date}T${this.newRendezVous.heureFin}:00`);

    // Préparer les données pour l'API
    const rdvRequest: RendezVousRequest = {
      dateRdvs: this.newRendezVous.date,
      heureDebut: this.newRendezVous.heureDebut,
      heureFin: this.newRendezVous.heureFin,
      statut: this.mapStatutForAPI(this.newRendezVous.statut),
      remarque: this.newRendezVous.notes,
      motif: this.newRendezVous.motif || this.newRendezVous.typeConsultation,
      idSecretaire: idSecretaire,
      idMedecin: this.newRendezVous.medecinId,
      idPatient: this.newRendezVous.patientId,
      idConsultation: null
    };

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    let operation$;
    
    if (this.isEditing && this.newRendezVous.id) {
      // Modifier un rendez-vous existant
      operation$ = this.rendezVousService.updateRendezVous(this.newRendezVous.id, rdvRequest);
    } else {
      // Créer un nouveau rendez-vous
      operation$ = this.rendezVousService.createRendezVous(rdvRequest);
    }

    const sub = operation$.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorMessage = '';
        
        // Afficher le message de succès
        this.successMessage = `Rendez-vous ${this.isEditing ? 'modifié' : 'créé'} avec succès !`;
        
        // Fermer le formulaire immédiatement
    this.resetForm();
    this.showAddForm = false;
        
        // Recharger la liste des rendez-vous
        this.loadRendezVous();
        this.applyFilters();
        
        // Faire disparaître le message de succès après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'opération:', error);
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage = error.error?.message || `Erreur lors de ${this.isEditing ? 'la modification' : 'la création'} du rendez-vous.`;
      }
    });

    this.subscriptions.add(sub);
  }

  // Mapper le statut du composant vers le format de l'API
  private mapStatutForAPI(statut: string): string {
    const statutMap: { [key: string]: string } = {
      'planifie': 'Planifié',
      'confirme': 'Confirmé',
      'annule': 'Annulé',
      'termine': 'Terminé'
    };
    return statutMap[statut] || 'Planifié';
  }

  onCancel() {
    if (confirm('Voulez-vous vraiment annuler? Toutes les données saisies seront perdues.')) {
      this.resetForm();
      this.showAddForm = false;
    }
  }

  resetForm() {
    this.newRendezVous = {
      id: 0,
      patientId: 0,
      medecinId: 0,
      date: '',
      heureDebut: '',
      heureFin: '',
      duree: 30,
      typeConsultation: '',
      motif: '',
      notes: '',
      statut: 'planifie',
      createdAt: new Date().toISOString()
    };
    this.selectedPatient = null;
    this.hasConflict = false;
    this.isEditing = false;
  }

  // Actions sur les rendez-vous
  editRendezVous(rdv: RendezVous) {
    this.newRendezVous = { ...rdv };
    this.selectedPatient = this.patients.find(p => p.id === rdv.patientId) || null;
    this.isEditing = true;
    this.showAddForm = true;
    this.checkConflict();
  }

  confirmRendezVous(rdv: RendezVous) {
    if (confirm(`Confirmer le rendez-vous de ${this.getPatientName(rdv.patientId)} avec ${this.getMedecinName(rdv.medecinId)} ?`)) {
      rdv.statut = 'confirme';
      this.applyFilters();
      alert('Rendez-vous confirmé!');
    }
  }

  cancelRendezVous(rdv: RendezVous) {
    if (confirm(`Annuler le rendez-vous de ${this.getPatientName(rdv.patientId)} avec ${this.getMedecinName(rdv.medecinId)} ?`)) {
      rdv.statut = 'annule';
      this.applyFilters();
      alert('Rendez-vous annulé!');
    }
  }

  deleteRendezVous(rdv: RendezVous) {
    if (confirm(`Supprimer définitivement le rendez-vous de ${this.getPatientName(rdv.patientId)} ? Cette action est irréversible.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const sub = this.rendezVousService.deleteRendezVous(rdv.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Rendez-vous supprimé avec succès !';
          
          // Recharger la liste des rendez-vous
          this.loadRendezVous();
      this.applyFilters();
          
          // Faire disparaître le message après 5 secondes
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression du rendez-vous.';
        }
      });
      
      this.subscriptions.add(sub);
    }
  }

  // Méthodes utilitaires
  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  }

  getPatientCIN(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? patient.cin : 'N/A';
  }

  getPatientInitials(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.prenom.charAt(0)}${patient.nom.charAt(0)}` : '??';
  }

  getMedecinName(medecinId: number): string {
    const medecin = this.medecins.find(m => m.id === medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin inconnu';
  }

  getMedecinSpecialite(medecinId: number): string {
    const medecin = this.medecins.find(m => m.id === medecinId);
    return medecin ? medecin.specialite : 'N/A';
  }

  getStatutText(statut: string): string {
    const statuts: { [key: string]: string } = {
      'planifie': 'Planifié',
      'confirme': 'Confirmé',
      'annule': 'Annulé',
      'termine': 'Terminé'
    };
    return statuts[statut] || statut;
  }

  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Gestion du calendrier
  generateWeekDays() {
    const startOfWeek = new Date(this.currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lundi
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      this.weekDays.push({
        name: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        date: date
      });
    }
  }

  getWeekRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`;
  }

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.generateWeekDays();
  }

  getRendezVousForDay(date: Date): RendezVous[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.rendezVous.filter(rdv => 
      rdv.date === dateStr && 
      rdv.statut !== 'annule'
    );
  }

  // Export
  exportRendezVous() {
    alert('Fonction d\'export des rendez-vous');
    // Implémentation de l'export CSV/Excel
  }
}
