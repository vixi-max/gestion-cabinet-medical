import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// CORRECT IMPORTS FOR YOUR INSTALLED VERSION
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';



interface Appointment {
  id: number;
  patientName: string;
  patientId: number;
  time: Date;
  duration: number; // en minutes
  type: 'consultation' | 'visite' | 'urgence' | 'suivi' | 'examen';
  status: 'confirmé' | 'en attente' | 'annulé' | 'terminé';
  notes?: string;
  color?: string;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.scss']
})
export class Agenda implements OnInit {
  // Vue actuelle
  currentView: 'day' | 'week' | 'month' | 'agenda' = 'week';
  
  // Date actuelle
  currentDate: Date = new Date();
  
  // Filtres
  filterType: string = 'all';
  filterStatus: string = 'all';
  searchQuery: string = '';
  
  // Modal
  showAppointmentModal: boolean = false;
  selectedAppointment: Appointment | null = null;
  isEditing: boolean = false;
  
  // Rendez-vous
  appointments: Appointment[] = [
    {
      id: 1,
      patientName: 'Jean Martin',
      patientId: 1,
      time: new Date(new Date().setHours(9, 0, 0, 0)),
      duration: 30,
      type: 'consultation',
      status: 'confirmé',
      notes: 'Contrôle hypertension'
    },
    {
      id: 2,
      patientName: 'Marie Curie',
      patientId: 2,
      time: new Date(new Date().setHours(10, 0, 0, 0)),
      duration: 45,
      type: 'suivi',
      status: 'confirmé',
      notes: 'Suivi asthme'
    },
    {
      id: 3,
      patientName: 'Paul Durand',
      patientId: 3,
      time: new Date(new Date().setHours(11, 0, 0, 0)),
      duration: 30,
      type: 'consultation',
      status: 'en attente'
    },
    {
      id: 4,
      patientName: 'Sophie Bernard',
      patientId: 4,
      time: new Date(new Date().setHours(14, 0, 0, 0)),
      duration: 60,
      type: 'examen',
      status: 'confirmé',
      notes: 'Échographie abdominale'
    },
    {
      id: 5,
      patientName: 'Robert Lefevre',
      patientId: 5,
      time: new Date(new Date().setHours(15, 30, 0, 0)),
      duration: 30,
      type: 'visite',
      status: 'confirmé'
    },
    {
      id: 6,
      patientName: 'Camille Dubois',
      patientId: 6,
      time: new Date(new Date().setHours(16, 30, 0, 0)),
      duration: 45,
      type: 'urgence',
      status: 'en attente',
      notes: 'Migraine sévère'
    }
  ];

  // Options du calendrier
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    locale: frLocale,
    firstDay: 1, // Lundi
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    nowIndicator: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Aujourd\'hui',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    events: this.getCalendarEvents(),
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin]
  };

  ngOnInit() {
    this.updateCalendarEvents();
  }

  // Méthodes pour le calendrier
  getCalendarEvents(): EventInput[] {
    return this.appointments.map(appointment => ({
      id: appointment.id.toString(),
      title: `${appointment.patientName} - ${this.getTypeLabel(appointment.type)}`,
      start: appointment.time,
      end: new Date(appointment.time.getTime() + appointment.duration * 60000),
      backgroundColor: this.getStatusColor(appointment.status),
      borderColor: this.getTypeColor(appointment.type),
      textColor: '#ffffff',
      extendedProps: {
        appointment: appointment
      }
    }));
  }

  updateCalendarEvents() {
    this.calendarOptions.events = this.getCalendarEvents();
  }

  // Gestion des événements du calendrier
  handleEventClick(info: any) {
    const appointment = info.event.extendedProps.appointment;
    this.selectedAppointment = appointment;
    this.isEditing = true;
    this.showAppointmentModal = true;
  }

  handleDateClick(info: any) {
    this.selectedAppointment = null;
    this.isEditing = false;
    this.showAppointmentModal = true;
  }

  handleEventDrop(info: any) {
    const appointmentId = parseInt(info.event.id);
    const newStart = info.event.start;
    
    const appointmentIndex = this.appointments.findIndex(a => a.id === appointmentId);
    if (appointmentIndex !== -1) {
      this.appointments[appointmentIndex].time = newStart;
      this.updateCalendarEvents();
    }
  }

  handleEventResize(info: any) {
    const appointmentId = parseInt(info.event.id);
    const newEnd = info.event.end;
    const appointment = this.appointments.find(a => a.id === appointmentId);
    
    if (appointment && newEnd) {
      const duration = (newEnd.getTime() - info.event.start.getTime()) / 60000;
      appointment.duration = duration;
      this.updateCalendarEvents();
    }
  }

  // Méthodes utilitaires
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'consultation': 'Consultation',
      'visite': 'Visite',
      'urgence': 'Urgence',
      'suivi': 'Suivi',
      'examen': 'Examen'
    };
    return labels[type] || type;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmé': '#10b981',
      'en attente': '#f59e0b',
      'annulé': '#ef4444',
      'terminé': '#6b7280'
    };
    return colors[status] || '#3b82f6';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'consultation': '#3b82f6',
      'visite': '#8b5cf6',
      'urgence': '#ef4444',
      'suivi': '#10b981',
      'examen': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  }

  // Filtrage et recherche
  getFilteredAppointments(): Appointment[] {
    let filtered = [...this.appointments];

    // Filtre par type
    if (this.filterType !== 'all') {
      filtered = filtered.filter(app => app.type === this.filterType);
    }

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }

    // Recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(query) ||
        app.notes?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Méthodes supplémentaires pour le template
  getDayName(dayIndex: number): string {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    return days[dayIndex - 1] || '';
  }

  getDayDate(dayIndex: number): string {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayIndex - today.getDay()));
    return targetDate.getDate().toString();
  }

  getAppointmentsForDay(dayIndex: number): Appointment[] {
    // Simuler des rendez-vous pour la semaine
    return this.appointments.filter((_, index) => index % 2 === 0).slice(0, 2);
  }

  getPatients(): any[] {
    // Simuler une liste de patients
    return [
      { id: 1, name: 'Jean Martin' },
      { id: 2, name: 'Marie Curie' },
      { id: 3, name: 'Paul Durand' },
      { id: 4, name: 'Sophie Bernard' },
      { id: 5, name: 'Robert Lefevre' },
      { id: 6, name: 'Camille Dubois' }
    ];
  }

  // Statistiques
  getTotalAppointments(): number {
    return this.appointments.length;
  }

  getConfirmedAppointments(): number {
    return this.appointments.filter(a => a.status === 'confirmé').length;
  }

  getPendingAppointments(): number {
    return this.appointments.filter(a => a.status === 'en attente').length;
  }

  getTodayAppointments(): number {
    const today = new Date().toDateString();
    return this.appointments.filter(a => a.time.toDateString() === today).length;
  }

  // Gestion des rendez-vous
  addAppointment(appointment: Appointment) {
    appointment.id = Math.max(...this.appointments.map(a => a.id), 0) + 1;
    this.appointments.push(appointment);
    this.updateCalendarEvents();
    this.showAppointmentModal = false;
  }

  updateAppointment(appointment: Appointment) {
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.appointments[index] = appointment;
      this.updateCalendarEvents();
      this.showAppointmentModal = false;
    }
  }

  deleteAppointment(id: number) {
    this.appointments = this.appointments.filter(a => a.id !== id);
    this.updateCalendarEvents();
    this.showAppointmentModal = false;
  }

  // Navigation
  goToToday() {
    this.currentDate = new Date();
    // Réinitialiser le calendrier à aujourd'hui
  }

  changeView(view: 'day' | 'week' | 'month' | 'agenda') {
    this.currentView = view;
  }

  // Modal
  closeModal() {
    this.showAppointmentModal = false;
    this.selectedAppointment = null;
  }

  saveAppointment(appointment: Appointment) {
    if (this.isEditing && this.selectedAppointment) {
      this.updateAppointment(appointment);
    } else {
      this.addAppointment(appointment);
    }
  }
}