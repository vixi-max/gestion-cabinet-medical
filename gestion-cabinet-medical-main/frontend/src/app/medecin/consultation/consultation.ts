import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
//import { Consultation as ConsultationService } from '../../services/consultation';
import { ConsultationService } from '../../services/consultation';
import { RendezVousService as RendezVousService } from '../../services/rendez-vous';
import { ConsultationResponse, ConsultationRequest, Consultation } from '../../models/consultation.model';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.html',
  styleUrls: ['./consultation.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [DatePipe]
})
export class ConsultationComponent implements OnInit, OnDestroy {
  // Données
  consultations: ConsultationResponse[] = [];
  filteredConsultations: ConsultationResponse[] = [];
  patients: any[] = [];
  rendezVousDisponibles: any[] = [];
  
  // Filtres
  searchTerm: string = '';
  selectedType: string = 'all';
  selectedStatus: string = 'all';
  selectedPatient: number = 0;
  startDate: string = '';
  endDate: string = '';
  consultationTypes: string[] = ['Générale', 'Spécialisée', 'Urgence', 'Suivi', 'Contrôle'];
  
  // Modales
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showRendezVousModal: boolean = false;
  showDetailsModal: boolean = false;
  
  // Objets temporaires
  newConsultation: ConsultationRequest = this.createEmptyConsultation();
  currentConsultation: ConsultationResponse | null = null;
  consultationDetails: ConsultationResponse | null = null;
  selectedRendezVous: any = { RendezVousId: 0, isTerminate: false };
  
  // États
  isLoading: boolean = false;
  isDeleting: boolean = false;
  
  // Statistiques
  stats = {
    total: 0,
    today: 0,
    completed: 0,
    pending: 0
  };
  
  // Formulaires
  consultationForm: FormGroup;
  
  // Date courante
  currentDate: Date = new Date();
  private dateInterval: any;
  
  constructor(
    private consultationService: ConsultationService,
    private rendezVousService: RendezVousService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.consultationForm = this.fb.group({
      type: ['', Validators.required],
      dateConsultation: ['', Validators.required],
      examenClinique: [''],
      examenSupplementaire: [''],
      diagnostic: ['', Validators.required],
      traitement: [''],
      observations: [''],
      idMedecin: [null, Validators.required],
      idRendezVous: [null]
    });
  }
  
  ngOnInit(): void {
    this.loadAllData();
    this.startDateUpdate();
  }
  
  ngOnDestroy(): void {
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
  }
  
  // Chargement des données
  loadAllData(): void {
    this.isLoading = true;
    
    Promise.all([
      this.loadConsultations(),
      this.loadPatients(),
      this.loadRendezVousDisponibles(),
      this.calculateStats()
    ]).finally(() => {
      this.isLoading = false;
    });
  }
  
  loadConsultations(): Promise<void> {
    return new Promise((resolve) => {
      // Service method not implemented - initialize empty list
      this.consultations = [];
      this.filteredConsultations = [];
      resolve();
    });
  }
  
  loadPatients(): Promise<void> {
    return new Promise((resolve) => {
      // PatientService not available - initialize empty
      this.patients = [];
      resolve();
    });
  }
  
  loadRendezVousDisponibles(): Promise<void> {
    return new Promise((resolve) => {
      // Service method not implemented - initialize empty list
      this.rendezVousDisponibles = [];
      resolve();
    });
  }
  
  // Calcul des statistiques
  calculateStats(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.stats.total = this.consultations.length;
    this.stats.today = this.consultations.filter(c => 
      this.formatDate(c.dateConsultation) === today
    ).length;
    
    this.stats.completed = this.consultations.filter(c => 
      c.facture !== null && c.diagnostic && c.traitement
    ).length;
    
    this.stats.pending = this.consultations.filter(c => 
      !c.diagnostic || !c.traitement
    ).length;
  }
  
  // Filtres
  applyFilters(): void {
    let filtered = [...this.consultations];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(consultation => 
        this.getPatientName(consultation).toLowerCase().includes(term) ||
        consultation.type.toLowerCase().includes(term) ||
        consultation.diagnostic?.toLowerCase().includes(term) ||
        consultation.traitement?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === this.selectedType);
    }
    
    // Filtre par statut
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(c => 
        this.getConsultationStatus(c) === (this.selectedStatus === 'completed' ? 'Complétée' : 'En cours')
      );
    }
    
    // Filtre par patient
    if (this.selectedPatient > 0) {
      // Patient filtering requires dossier data not available in ConsultationResponse
      // filtered = filtered.filter(c => c.idDossierMedical === this.selectedPatient);
    }
    
    // Filtre par date
    if (this.startDate) {
      filtered = filtered.filter(c => 
        new Date(c.dateConsultation) >= new Date(this.startDate)
      );
    }
    
    if (this.endDate) {
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => 
        new Date(c.dateConsultation) <= endDate
      );
    }
    
    this.filteredConsultations = filtered;
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.selectedPatient = 0;
    this.startDate = '';
    this.endDate = '';
    this.filteredConsultations = [...this.consultations];
  }
  
  // Gestion des consultations
  openAddModal(): void {
    this.newConsultation = this.createEmptyConsultation();
    this.showAddModal = true;
  }
  
  addConsultation(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const consultationData = { ...this.newConsultation };
    
    // Validation des champs obligatoires
    if (!consultationData.diagnostic || !consultationData.type || !consultationData.dateConsultation) {
      alert('Veuillez remplir tous les champs obligatoires');
      this.isLoading = false;
      return;
    }
    
    // Service not implemented - simulate local add
    const nextId = this.consultations.length ? Math.max(...this.consultations.map(c => c.idConsultation)) + 1 : 1;
    const response: ConsultationResponse = {
      idConsultation: nextId,
      ...consultationData
    } as ConsultationResponse;
    
    this.consultations.unshift(response);
    this.filteredConsultations.unshift(response);
    this.calculateStats();
    this.showAddModal = false;
    this.isLoading = false;
    alert('Consultation créée avec succès!');
  }
  
  openEditModal(consultation: ConsultationResponse): void {
    this.currentConsultation = { ...consultation };
    this.showEditModal = true;
  }
  
  updateConsultation(): void {
    if (!this.currentConsultation || this.isLoading) return;
    
    this.isLoading = true;
    
    // Service not implemented - simulate local update
    const index = this.consultations.findIndex(c => c.idConsultation === this.currentConsultation!.idConsultation);
    if (index !== -1) {
      this.consultations[index] = this.currentConsultation;
      this.filteredConsultations[index] = this.currentConsultation;
    }
    this.showEditModal = false;
    this.isLoading = false;
    alert('Consultation mise à jour avec succès!');
  }
  
  deleteConsultation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      this.isDeleting = true;
      
      // Service not implemented - simulate local delete
      this.consultations = this.consultations.filter(c => c.idConsultation !== id);
      this.filteredConsultations = this.filteredConsultations.filter(c => c.idConsultation !== id);
      this.calculateStats();
      this.isDeleting = false;
      alert('Consultation supprimée avec succès!');
    }
  }
  
  // Rendez-vous vers consultation
  openRendezVousModal(): void {
    this.loadRendezVousDisponibles();
    this.selectedRendezVous = { RendezVousId: 0, isTerminate: false };
    this.showRendezVousModal = true;
  }
  
  createFromRendezVous(): void {
    if (!this.selectedRendezVous.RendezVousId || this.isLoading) {
      alert('Veuillez sélectionner un rendez-vous');
      return;
    }
    
    const selectedRdv = this.rendezVousDisponibles.find(
      rdv => rdv.idRendezVous === this.selectedRendezVous.RendezVousId
    );
    
    if (!selectedRdv) return;
    
    this.isLoading = true;
    
    // Pré-remplir les données depuis le rendez-vous
    this.newConsultation = {
      type: selectedRdv.type || 'Générale',
      dateConsultation: selectedRdv.dateRendezVous || new Date().toISOString(),
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: '',
      idDossierMedical: selectedRdv.idDossierMedical || 0,
      idMedecin: selectedRdv.idMedecin,
      idRendezVous: selectedRdv.idRendezVous
    };
    
    // Service method not implemented - just open the modal
    this.showRendezVousModal = false;
    this.showAddModal = true;
    this.isLoading = false;
  }
  
  // Utilitaires
  openDetailsModal(consultation: ConsultationResponse): void {
    this.consultationDetails = { ...consultation };
    this.showDetailsModal = true;
  }

  getPatientName(consultation: ConsultationResponse): string {
    // Patient data not available in ConsultationResponse - use nomMedecin if available
    if (consultation.nomMedecin) return consultation.nomMedecin;
    return 'Patient inconnu';
  }
  
  getConsultationStatus(consultation: ConsultationResponse): string {
    if (consultation.facture && consultation.diagnostic && consultation.traitement) {
      return 'Complétée';
    }
    return 'En cours';
  }
  
  getStatusClass(status: string): string {
    return status === 'Complétée' ? 'completed' : 'pending';
  }
  
  formatDate(date: any): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }
  
  // Export
  exportToPDF(consultation: ConsultationResponse): void {
    console.log('Export PDF pour:', consultation);
    // Implémentez ici la logique d'export PDF
  }
  
  exportAll(): void {
    console.log('Export de toutes les consultations');
    // Implémentez ici la logique d'export global
  }
  
  generateFacture(consultation: ConsultationResponse): void {
    console.log('Générer facture pour:', consultation);
    // Implémentez ici la génération de facture
  }
  
  // Méthodes privées
  private createEmptyConsultation(): ConsultationRequest {
    return {
      type: '',
      dateConsultation: new Date().toISOString(),
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: '',
      idDossierMedical: 0,
      idMedecin: 0,
      idRendezVous: undefined
    };
  }
  
  private startDateUpdate(): void {
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000); // Met à jour chaque minute
  }
}