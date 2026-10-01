// src/app/services/cabinet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';


// Interfaces exportées depuis le service
export interface Cabinet {
  id: number;
  logo?: string;
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  superAdminId?: number;
  createdAt?: string;
  updatedAt?: string;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
}

export interface CabinetFormData {
  logo?: File;
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  superAdminId?: number;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
}

export interface CabinetStats {
  total: number;
  actifs: number;
  inactifs: number;
  suspendus: number;
}

export interface CabinetFilter {
  searchTerm: string;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'ALL';
  page: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class CabinetService {

  private apiUrl = 'http://localhost:8080/api/cabinet';
  private currentCabinetSubject = new BehaviorSubject<Cabinet | null>(null);
  public currentCabinet$ = this.currentCabinetSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer tous les cabinets
  getAllCabinets(): Observable<Cabinet[]> {
    return this.http.get<Cabinet[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching cabinets:', error);
          // Retourner des données mockées pour le développement
          return this.getMockCabinets();
        })
      );
  }

  // Récupérer un cabinet par ID
  getCabinetById(id: number): Observable<Cabinet> {
    return this.http.get<Cabinet>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching cabinet by ID:', error);
          // Retourner un cabinet mocké pour le développement
          return this.getMockCabinets().pipe(
            map(cabinets => cabinets.find(c => c.id === id) || cabinets[0])
          );
        })
      );
  }

  // Créer un cabinet
  createCabinet(cabinetData: CabinetFormData): Observable<Cabinet> {
    // Si un fichier logo est présent, utiliser FormData
    if (cabinetData.logo instanceof File) {
      const formData = new FormData();
      formData.append('nomCabinet', cabinetData.nomCabinet);
      formData.append('adresseCabinet', cabinetData.adresseCabinet);
      formData.append('emailCabinet', cabinetData.emailCabinet);
      formData.append('teleCabinet', cabinetData.teleCabinet);
      
      if (cabinetData.logo) {
        formData.append('logo', cabinetData.logo);
      }
      
      if (cabinetData.superAdminId) {
        formData.append('superAdminId', cabinetData.superAdminId.toString());
      }
      
      if (cabinetData.statut) {
        formData.append('statut', cabinetData.statut);
      }
      
      return this.http.post<Cabinet>(this.apiUrl, formData);
    } else {
      // Sinon, envoyer en JSON
      const dataToSend = {
        nomCabinet: cabinetData.nomCabinet,
        adresseCabinet: cabinetData.adresseCabinet,
        emailCabinet: cabinetData.emailCabinet,
        teleCabinet: cabinetData.teleCabinet,
        superAdminId: cabinetData.superAdminId,
        statut: cabinetData.statut || 'ACTIF'
      };
      
      return this.http.post<Cabinet>(this.apiUrl, dataToSend);
    }
  }

  // Mettre à jour un cabinet
  updateCabinet(id: number, cabinetData: CabinetFormData): Observable<Cabinet> {
    // Si un fichier logo est présent, utiliser FormData
    if (cabinetData.logo instanceof File) {
      const formData = new FormData();
      formData.append('nomCabinet', cabinetData.nomCabinet);
      formData.append('adresseCabinet', cabinetData.adresseCabinet);
      formData.append('emailCabinet', cabinetData.emailCabinet);
      formData.append('teleCabinet', cabinetData.teleCabinet);
      
      if (cabinetData.logo) {
        formData.append('logo', cabinetData.logo);
      }
      
      if (cabinetData.superAdminId) {
        formData.append('superAdminId', cabinetData.superAdminId.toString());
      }
      
      if (cabinetData.statut) {
        formData.append('statut', cabinetData.statut);
      }
      
      return this.http.put<Cabinet>(`${this.apiUrl}/${id}`, formData);
    } else {
      // Sinon, envoyer en JSON
      const dataToSend = {
        nomCabinet: cabinetData.nomCabinet,
        adresseCabinet: cabinetData.adresseCabinet,
        emailCabinet: cabinetData.emailCabinet,
        teleCabinet: cabinetData.teleCabinet,
        superAdminId: cabinetData.superAdminId,
        statut: cabinetData.statut || 'ACTIF'
      };
      
      return this.http.put<Cabinet>(`${this.apiUrl}/${id}`, dataToSend);
    }
  }

  // Supprimer un cabinet
  deleteCabinet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting cabinet:', error);
          throw error;
        })
      );
  }

  // Récupérer les statistiques des cabinets
  getCabinetStats(): Observable<CabinetStats> {
    return this.http.get<CabinetStats>(`${this.apiUrl}/stats`)
      .pipe(
        catchError(error => {
          console.error('Error fetching cabinet stats:', error);
          // Retourner des stats mockées pour le développement
          return of({
            total: 3,
            actifs: 2,
            inactifs: 1,
            suspendus: 0
          });
        })
      );
  }

  // Rechercher et filtrer les cabinets (avec pagination)
  searchCabinets(filter: CabinetFilter): Observable<PaginatedResponse<Cabinet>> {
    const params: any = {
      page: filter.page.toString(),
      size: filter.itemsPerPage.toString()
    };
    
    if (filter.searchTerm) {
      params.search = filter.searchTerm;
    }
    
    if (filter.statut && filter.statut !== 'ALL') {
      params.statut = filter.statut;
    }
    
    return this.http.get<PaginatedResponse<Cabinet>>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(error => {
          console.error('Error searching cabinets:', error);
          // Retourner des données mockées pour le développement
          return this.getMockPaginatedResponse(filter);
        })
      );
  }

  // Définir le cabinet courant
  setCurrentCabinet(cabinetId: string | number): Observable<Cabinet> {
    const id = typeof cabinetId === 'string' ? parseInt(cabinetId) : cabinetId;
    
    // Si ID est 0 ou vide, réinitialiser
    if (!id) {
      this.currentCabinetSubject.next(null);
      return of(null as any);
    }
    
    return this.getCabinetById(id).pipe(
      tap(cabinet => {
        if (cabinet) {
          this.currentCabinetSubject.next(cabinet);
        }
      })
    );
  }

  // Méthodes pour les données mockées
  private getMockCabinets(): Observable<Cabinet[]> {
    const mockCabinets: Cabinet[] = [
      {
        id: 1,
        logo: 'https://via.placeholder.com/150',
        nomCabinet: 'Clinique Santé Plus',
        adresseCabinet: '123 Rue de la Santé, Paris 75001',
        emailCabinet: 'contact@santeparis.fr',
        teleCabinet: '01 23 45 67 89',
        superAdminId: 1,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        statut: 'ACTIF'
      },
      {
        id: 2,
        logo: 'https://via.placeholder.com/150',
        nomCabinet: 'Centre Médical du Nord',
        adresseCabinet: '456 Avenue du Nord, Lille 59000',
        emailCabinet: 'info@medicalnord.fr',
        teleCabinet: '03 20 12 34 56',
        superAdminId: 2,
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        statut: 'ACTIF'
      },
      {
        id: 3,
        nomCabinet: 'Polyclinique Sud',
        adresseCabinet: '789 Boulevard du Sud, Marseille 13000',
        emailCabinet: 'contact@polysud.fr',
        teleCabinet: '04 91 23 45 67',
        superAdminId: 3,
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z',
        statut: 'INACTIF'
      },
      {
        id: 4,
        logo: 'https://via.placeholder.com/150',
        nomCabinet: 'Cabinet Dentaire Central',
        adresseCabinet: '101 Rue Centrale, Lyon 69000',
        emailCabinet: 'dentaire@central.fr',
        teleCabinet: '04 78 12 34 56',
        superAdminId: 4,
        createdAt: '2024-01-18T11:45:00Z',
        updatedAt: '2024-01-18T11:45:00Z',
        statut: 'ACTIF'
      },
      {
        id: 5,
        nomCabinet: 'Institut de Radiologie',
        adresseCabinet: '202 Avenue des Sciences, Toulouse 31000',
        emailCabinet: 'contact@radiologie.fr',
        teleCabinet: '05 61 23 45 67',
        superAdminId: 5,
        createdAt: '2024-01-19T16:30:00Z',
        updatedAt: '2024-01-19T16:30:00Z',
        statut: 'SUSPENDU'
      }
    ];
    
    return of(mockCabinets);
  }

  private getMockPaginatedResponse(filter: CabinetFilter): Observable<PaginatedResponse<Cabinet>> {
    return this.getMockCabinets().pipe(
      map(cabinets => {
        // Appliquer le filtre de recherche
        let filtered = cabinets;
        
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filtered = filtered.filter(cabinet =>
            cabinet.nomCabinet.toLowerCase().includes(term) ||
            cabinet.adresseCabinet.toLowerCase().includes(term) ||
            cabinet.emailCabinet.toLowerCase().includes(term)
          );
        }
        
        // Appliquer le filtre de statut
        if (filter.statut && filter.statut !== 'ALL') {
          filtered = filtered.filter(cabinet => cabinet.statut === filter.statut);
        }
        
        // Appliquer la pagination
        const startIndex = (filter.page - 1) * filter.itemsPerPage;
        const endIndex = startIndex + filter.itemsPerPage;
        const paginatedItems = filtered.slice(startIndex, endIndex);
        
        return {
          items: paginatedItems,
          total: filtered.length,
          page: filter.page,
          totalPages: Math.ceil(filtered.length / filter.itemsPerPage),
          hasNext: endIndex < filtered.length,
          hasPrev: startIndex > 0
        };
      })
    );
  }

  // Méthode utilitaire pour télécharger un logo
  uploadLogo(cabinetId: number, logoFile: File): Observable<Cabinet> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return this.http.post<Cabinet>(`${this.apiUrl}/${cabinetId}/logo`, formData);
  }

  // Méthode utilitaire pour supprimer un logo
  deleteLogo(cabinetId: number): Observable<Cabinet> {
    return this.http.delete<Cabinet>(`${this.apiUrl}/${cabinetId}/logo`);
  }

  // Vérifier si un email est disponible
  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}`)
      .pipe(
        catchError(error => {
          console.error('Error checking email availability:', error);
          // Par défaut, retourner true pour le développement
          return of(true);
        })
      );
  }
}