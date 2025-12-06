import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit {

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idEvento: number = 0;
  public token: string = "";

  // Tema para el timepicker reloj material
  public timePickerTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#667eea'
    },
    dial: {
      dialBackgroundColor: '#667eea',
    },
    clockFace: {
      clockFaceBackgroundColor: '#f0f0f0',
      clockHandColor: '#667eea',
      clockFaceTimeInactiveColor: '#6c757d'
    }
  };

  public programasEducativos: any[] = [
    {value: 'Ingeniería en Ciencias de la Computación', viewValue:'Ingeniería en Ciencias de la Computación'},
    {value: 'Licenciatura en Ciencias de la Computación', viewValue:'Licenciatura en Ciencias de la Computación'},
    {value: 'Ingeniería en Tecnologías de la Información', viewValue:'Ingeniería en Tecnologías de la Información'}
  ];

  public tiposEvento: any[] = [
    {value: 'Conferencia', viewValue: 'Conferencia'},
    {value: 'Taller', viewValue: 'Taller'},
    {value: 'Seminario', viewValue: 'Seminario'},
    {value: 'Concurso', viewValue: 'Concurso'}
  ];

  public responsables: any[] = [];

  public publicosObjetivo: any[] = [
    {value: 'Estudiantes', nombre: 'Estudiantes'},
    {value: 'Profesores', nombre: 'Profesores'},
    {value: 'Público general', nombre: 'Público general'}
  ];

  public fechaMinima = new Date();

  constructor(
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public facadeService: FacadeService,
    private eventosService: EventosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.obtenerResponsables();

    // Verificar si viene el parámetro id en queryParams
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.editar = true;
        this.idEvento = Number(params['id']);
        this.obtenerEvento();
      } else {
        this.evento = this.eventosService.esquemaEvento();
        this.token = this.facadeService.getSessionToken();
        this.evento.publico_objetivo = [];
      }
    });
  }

  public registrar() {
    this.errors = {};

    if (this.evento.fecha_realizacion instanceof Date) {
      this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
    }

    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    const eventoParaEnviar = {
      ...this.evento,
      publico_objetivo: JSON.stringify(this.evento.publico_objetivo)
    };

    this.eventosService.registrarEvento(eventoParaEnviar).subscribe({
      next: (response: any) => {
        alert('Evento registrado con éxito');

        if (this.token && this.token != '') {
          this.router.navigate(['eventos-academicos']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          alert('Error al registrar el evento. Revisa la consola para más detalles.');
        }
      }
    });

    return true;
  }

  public actualizar() {
    this.errors = {};

    if (this.evento.fecha_realizacion instanceof Date) {
      this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
    }

    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
      width: '400px',
      data: {
        nombre: this.evento.nombre_evento
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isEdit) {
        // Usuario confirmó la edición
        const eventoParaEnviar = {
          ...this.evento,
          publico_objetivo: JSON.stringify(this.evento.publico_objetivo)
        };

        console.log('Datos a enviar para actualización:', eventoParaEnviar);
        console.log('ID del evento:', this.idEvento);

        this.eventosService.actualizarEvento(this.idEvento, eventoParaEnviar).subscribe(
          (response) => {
            alert('Evento actualizado exitosamente');
            this.router.navigate(['eventos-academicos']);
          },
          (error) => {
            if (error.status === 400) {
              alert('Error: Datos inválidos. Revisa los campos del formulario.');
            } else if (error.status === 404) {
              alert('Error: El evento no fue encontrado.');
            } else if (error.status === 401) {
              alert('Error: No estás autorizado. Inicia sesión nuevamente.');
            } else {
              alert('Error al actualizar evento. Revisa la consola para más detalles.');
            }
          }
        );
      }
    });

    return true;
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      this.evento.publico_objetivo.forEach((publico: string, i: number) => {
        if (publico == event.source.value) {
          this.evento.publico_objetivo.splice(i, 1);
        }
      });
    }

    if (!this.evento.publico_objetivo.includes('Estudiantes')) {
      this.evento.programa_educativo = '';
    }
  }

  public revisarSeleccion(nombre: string) {
    if (this.evento.publico_objetivo) {
      var busqueda = this.evento.publico_objetivo.find((element: string) => element == nombre);
      if (busqueda != undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public obtenerResponsables() {
    this.eventosService.getMaestrosYAdministradores().subscribe(
      (response) => {
        this.responsables = [];

        if (response.maestros && Array.isArray(response.maestros)) {
          response.maestros.forEach((maestro: any) => {
            this.responsables.push({
              id: maestro.user.id,
              nombre_completo: `${maestro.user.first_name} ${maestro.user.last_name}`,
              rol: 'Maestro'
            });
          });
        }

        if (response.admins && Array.isArray(response.admins)) {
          response.admins.forEach((admin: any) => {
            this.responsables.push({
              id: admin.user.id,
              nombre_completo: `${admin.user.first_name} ${admin.user.last_name}`,
              rol: 'Administrador'
            });
          });
        }

        console.log("Responsables obtenidos:", this.responsables);
      },
      (error) => {
        console.error("Error al obtener responsables:", error);
      }
    );
  }

  public obtenerEvento() {
    this.eventosService.getEventoById(this.idEvento).subscribe(
      (response) => {
        this.evento = response;

        // Convertir publico_objetivo de string JSON a array
        if (this.evento.publico_objetivo && typeof this.evento.publico_objetivo === 'string') {
          try {
            let parsed = JSON.parse(this.evento.publico_objetivo);
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
            this.evento.publico_objetivo = parsed;
          } catch (error) {
            this.evento.publico_objetivo = [];
          }
        }

        if (!Array.isArray(this.evento.publico_objetivo)) {
          this.evento.publico_objetivo = [];
        }

        // Convertir fecha de string a Date object
        if (this.evento.fecha_realizacion) {
          const [year, month, day] = this.evento.fecha_realizacion.split('-');
          this.evento.fecha_realizacion = new Date(Number(year), Number(month) - 1, Number(day));
        }

        // Convertir horas de HH:mm:ss a HH:mm
        if (this.evento.hora_inicio && this.evento.hora_inicio.length > 5) {
          this.evento.hora_inicio = this.evento.hora_inicio.substring(0, 5);
        }

        if (this.evento.hora_fin && this.evento.hora_fin.length > 5) {
          this.evento.hora_fin = this.evento.hora_fin.substring(0, 5);
        }

        if (!this.evento.programa_educativo) {
          this.evento.programa_educativo = '';
        }
      },
      (error) => {
        alert('No se pudo cargar la información del evento');
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  public changeFecha(event: any) {
    this.evento.fecha_realizacion = event.value.toISOString().split('T')[0];
  }

  public soloLetrasYNumeros(event: KeyboardEvent) {
    const pattern = /[a-zA-Z0-9\s]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public validarHoras() {
    if (this.evento.hora_inicio && this.evento.hora_fin) {
      if (this.evento.hora_inicio >= this.evento.hora_fin) {
        this.errors.hora_fin = 'La hora de finalización debe ser mayor que la hora de inicio';
      } else {
        delete this.errors.hora_fin;
      }
    }
  }
}
