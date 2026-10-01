import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderSec } from '../header-sec/header-sec';

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

export interface Prestation {
  description: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Invoice {
  id: number;
  numero: number;
  patientId: number;
  dateFacture: string;
  dateEcheance: string;
  prestations: Prestation[];
  montantTotal: number;
  remise: number;
  statut: 'brouillon' | 'envoyee' | 'partiellement-payee' | 'payee' | 'annulee';
  modePaiement: string;
  notes: string;
  createdAt: string;
}

export interface Stats {
  chiffreAffaireTotal: number;
  evolutionCA: number;
  facturesEnAttente: number;
  montantEnAttente: number;
  facturesPayees: number;
  tauxPaiement: number;
  montantMoyen: number;
}

@Component({
  selector: 'app-facture',
  imports: [CommonModule, FormsModule, ],
  templateUrl: './facture.html',
  styleUrl: './facture.scss',
})
export class FactureComponent implements OnInit {
  currentDate: Date = new Date();
  searchTerm: string = '';
  showAddForm: boolean = false;
  isEditing: boolean = false;
  viewMode: 'list' | 'grid' = 'list';
  
  // Filtres
  filterStatut: string = '';
  filterDateDebut: string = '';
  filterDateFin: string = '';
  filterMontantMin: number = 0;
  filterMontantMax: number = 10000;

  // Statistiques
  stats: Stats = {
    chiffreAffaireTotal: 0,
    evolutionCA: 0,
    facturesEnAttente: 0,
    montantEnAttente: 0,
    facturesPayees: 0,
    tauxPaiement: 0,
    montantMoyen: 0
  };

  // Données des patients
  patients: Patient[] = [
    {
      id: 1,
      cin: 'AB123456',
      nom: 'Smith',
      prenom: 'John',
      dateNaissance: '1985-03-15',
      sexe: 'M',
      numTel: '0612345678',
      typeMutuelle: 'CNOPS'
    },
    {
      id: 2,
      cin: 'CD789012',
      nom: 'Johnson',
      prenom: 'Emma',
      dateNaissance: '1990-07-22',
      sexe: 'F',
      numTel: '0623456789',
      typeMutuelle: 'CNSS'
    },
    {
      id: 3,
      cin: 'EF345678',
      nom: 'Brown',
      prenom: 'Michael',
      dateNaissance: '1978-11-30',
      sexe: 'M',
      numTel: '0634567890',
      typeMutuelle: 'Assurance Privée'
    }
  ];

  // Nouvelle facture
  newFacture: Invoice = {
    id: 0,
    numero: 0,
    patientId: 0,
    dateFacture: '',
    dateEcheance: '',
    prestations: [],
    montantTotal: 0,
    remise: 0,
    statut: 'brouillon',
    modePaiement: '',
    notes: '',
    createdAt: new Date().toISOString()
  };

  // Patient sélectionné
  selectedPatient: Patient | null = null;

  // Liste des factures
  factures: Invoice[] = [];
  filteredFactures: Invoice[] = [];

  ngOnInit(): void {
    this.loadSampleData();
    this.updateStats();
    
    // Mettre à jour l'heure chaque minute
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  loadSampleData() {
    // Données d'exemple de factures
    this.factures = [
      {
        id: 1,
        numero: 1001,
        patientId: 1,
        dateFacture: '2024-01-15',
        dateEcheance: '2024-02-15',
        prestations: [
          { description: 'Consultation générale', quantite: 1, prixUnitaire: 300 },
          { description: 'Analyse sanguine', quantite: 1, prixUnitaire: 150 }
        ],
        montantTotal: 450,
        remise: 0,
        statut: 'payee',
        modePaiement: 'carte',
        notes: 'Patient régulier',
        createdAt: '2024-01-15T10:00:00'
      },
      {
        id: 2,
        numero: 1002,
        patientId: 2,
        dateFacture: '2024-01-16',
        dateEcheance: '2024-02-16',
        prestations: [
          { description: 'Consultation spécialisée', quantite: 1, prixUnitaire: 500 },
          { description: 'Radiographie', quantite: 1, prixUnitaire: 250 }
        ],
        montantTotal: 750,
        remise: 10,
        statut: 'envoyee',
        modePaiement: '',
        notes: 'À envoyer par email',
        createdAt: '2024-01-16T14:30:00'
      },
      {
        id: 3,
        numero: 1003,
        patientId: 3,
        dateFacture: '2024-01-17',
        dateEcheance: '2024-01-31',
        prestations: [
          { description: 'Consultation urgence', quantite: 1, prixUnitaire: 400 },
          { description: 'Médicaments', quantite: 2, prixUnitaire: 75 }
        ],
        montantTotal: 550,
        remise: 5,
        statut: 'partiellement-payee',
        modePaiement: 'especes',
        notes: 'Acompte reçu',
        createdAt: '2024-01-17T09:15:00'
      },
      {
        id: 4,
        numero: 1004,
        patientId: 1,
        dateFacture: '2024-01-18',
        dateEcheance: '2024-02-18',
        prestations: [
          { description: 'Contrôle routine', quantite: 1, prixUnitaire: 200 }
        ],
        montantTotal: 200,
        remise: 0,
        statut: 'brouillon',
        modePaiement: '',
        notes: 'À finaliser',
        createdAt: '2024-01-18T16:45:00'
      }
    ];

    this.filteredFactures = [...this.factures];
  }

  updateStats() {
    const facturesPayees = this.factures.filter(f => f.statut === 'payee');
    const facturesEnAttente = this.factures.filter(f => 
      f.statut === 'envoyee' || f.statut === 'partiellement-payee'
    );

    const chiffreAffaireTotal = this.factures
      .filter(f => f.statut !== 'annulee')
      .reduce((sum, f) => sum + f.montantTotal, 0);

    const montantEnAttente = facturesEnAttente
      .reduce((sum, f) => sum + f.montantTotal, 0);

    const montantMoyen = this.factures.length > 0 
      ? Math.round(chiffreAffaireTotal / this.factures.length)
      : 0;

    const tauxPaiement = this.factures.length > 0
      ? Math.round((facturesPayees.length / this.factures.length) * 100)
      : 0;

    this.stats = {
      chiffreAffaireTotal,
      evolutionCA: 12, // Simulation
      facturesEnAttente: facturesEnAttente.length,
      montantEnAttente,
      facturesPayees: facturesPayees.length,
      tauxPaiement,
      montantMoyen
    };
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.factures];

    // Filtre par recherche texte
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(facture =>
        facture.numero.toString().includes(term) ||
        this.getPatientName(facture.patientId).toLowerCase().includes(term) ||
        this.getPatientCIN(facture.patientId).toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.filterStatut) {
      filtered = filtered.filter(facture => facture.statut === this.filterStatut);
    }

    // Filtre par date
    if (this.filterDateDebut) {
      filtered = filtered.filter(facture => facture.dateFacture >= this.filterDateDebut);
    }

    if (this.filterDateFin) {
      filtered = filtered.filter(facture => facture.dateFacture <= this.filterDateFin);
    }

    // Filtre par montant
    if (this.filterMontantMin) {
      filtered = filtered.filter(facture => facture.montantTotal >= this.filterMontantMin);
    }

    if (this.filterMontantMax) {
      filtered = filtered.filter(facture => facture.montantTotal <= this.filterMontantMax);
    }

    this.filteredFactures = filtered;
  }

  // Gestion des événements du formulaire
  onPatientChange() {
    this.selectedPatient = this.patients.find(p => p.id === this.newFacture.patientId) || null;
  }

  ajouterPrestation() {
    this.newFacture.prestations.push({
      description: '',
      quantite: 1,
      prixUnitaire: 0
    });
  }

  supprimerPrestation(index: number) {
    this.newFacture.prestations.splice(index, 1);
    this.calculerTotal();
  }

  calculerTotal() {
    const sousTotal = this.calculerSousTotal();
    const montantRemise = this.calculerMontantRemise();
    this.newFacture.montantTotal = sousTotal - montantRemise;
  }

  calculerSousTotal(): number {
    return this.newFacture.prestations.reduce((total, prestation) => {
      return total + (prestation.quantite * prestation.prixUnitaire);
    }, 0);
  }

  calculerMontantRemise(): number {
    const sousTotal = this.calculerSousTotal();
    return (sousTotal * this.newFacture.remise) / 100;
  }

  calculerMontantRemiseFacture(facture: Invoice): number {
    const sousTotal = facture.prestations.reduce((total, prestation) => {
      return total + (prestation.quantite * prestation.prixUnitaire);
    }, 0);
    return (sousTotal * facture.remise) / 100;
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.isEditing) {
      // Modification
      const index = this.factures.findIndex(f => f.id === this.newFacture.id);
      if (index !== -1) {
        this.factures[index] = { ...this.newFacture };
      }
      alert('Facture modifiée avec succès!');
    } else {
      // Nouvelle facture
      this.newFacture.id = this.factures.length > 0 ? Math.max(...this.factures.map(f => f.id)) + 1 : 1;
      this.newFacture.numero = this.factures.length > 0 ? Math.max(...this.factures.map(f => f.numero)) + 1 : 1000;
      this.factures.push({ ...this.newFacture });
      alert('Facture créée avec succès!');
    }

    this.updateStats();
    this.applyFilters();
    this.resetForm();
    this.showAddForm = false;
  }

  onCancel() {
    if (confirm('Voulez-vous vraiment annuler? Toutes les données saisies seront perdues.')) {
      this.resetForm();
      this.showAddForm = false;
    }
  }

  resetForm() {
    this.newFacture = {
      id: 0,
      numero: 0,
      patientId: 0,
      dateFacture: '',
      dateEcheance: '',
      prestations: [],
      montantTotal: 0,
      remise: 0,
      statut: 'brouillon',
      modePaiement: '',
      notes: '',
      createdAt: new Date().toISOString()
    };
    this.selectedPatient = null;
    this.isEditing = false;
  }

  // Actions sur les factures
  modifierFacture(facture: Invoice) {
    this.newFacture = { ...facture };
    this.selectedPatient = this.patients.find(p => p.id === facture.patientId) || null;
    this.isEditing = true;
    this.showAddForm = true;
  }

  voirDetails(facture: Invoice) {
    alert(`Détails de la facture FAC-${facture.numero}\nPatient: ${this.getPatientName(facture.patientId)}\nMontant: ${facture.montantTotal} MAD`);
  }

  imprimerFacture(facture: Invoice) {
    alert(`Impression de la facture FAC-${facture.numero}`);
    // Logique d'impression
  }

  envoyerFacture(facture: Invoice) {
    if (confirm(`Envoyer la facture FAC-${facture.numero} au patient ?`)) {
      facture.statut = 'envoyee';
      this.applyFilters();
      alert('Facture envoyée!');
    }
  }

  enregistrerPaiement(facture: Invoice) {
    const montant = prompt(`Montant du paiement pour la facture FAC-${facture.numero} (${facture.montantTotal} MAD):`, facture.montantTotal.toString());
    
    if (montant) {
      const montantPaye = parseFloat(montant);
      if (montantPaye >= facture.montantTotal) {
        facture.statut = 'payee';
        facture.modePaiement = facture.modePaiement || 'especes';
      } else if (montantPaye > 0) {
        facture.statut = 'partiellement-payee';
        facture.modePaiement = facture.modePaiement || 'especes';
      }
      
      this.applyFilters();
      alert('Paiement enregistré!');
    }
  }

  supprimerFacture(facture: Invoice) {
    if (confirm(`Supprimer définitivement la facture FAC-${facture.numero} ? Cette action est irréversible.`)) {
      this.factures = this.factures.filter(f => f.id !== facture.id);
      this.updateStats();
      this.applyFilters();
      alert('Facture supprimée!');
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

  getStatutText(statut: string): string {
    const statuts: { [key: string]: string } = {
      'brouillon': 'Brouillon',
      'envoyee': 'Envoyée',
      'partiellement-payee': 'Partiellement Payée',
      'payee': 'Payée',
      'annulee': 'Annulée'
    };
    return statuts[statut] || statut;
  }

  getModePaiementText(mode: string): string {
    const modes: { [key: string]: string } = {
      'especes': 'Espèces',
      'carte': 'Carte Bancaire',
      'cheque': 'Chèque',
      'virement': 'Virement',
      'mutuelle': 'Mutuelle'
    };
    return modes[mode] || mode;
  }

  isEnRetard(facture: Invoice): boolean {
    if (!facture.dateEcheance || facture.statut === 'payee' || facture.statut === 'annulee') {
      return false;
    }
    
    const aujourdhui = new Date();
    const echeance = new Date(facture.dateEcheance);
    return echeance < aujourdhui;
  }

  exporterFactures() {
    alert('Export des factures en cours...');
    // Logique d'export CSV/Excel
  }

  // Méthode pour tronquer le texte (remplacement du pipe)
  truncateText(text: string, limit: number = 25): string {
    if (!text) return '';
    
    if (text.length <= limit) {
      return text;
    }
    
    return text.substr(0, limit) + '...';
  }
}