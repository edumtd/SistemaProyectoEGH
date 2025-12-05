import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component';

@Component({
  selector: 'app-eventos-academicos-screen',
  templateUrl: './eventos-academicos-screen.component.html',
  styleUrls: ['./eventos-academicos-screen.component.scss']
})
export class EventosAcademicosScreenComponent implements OnInit, AfterViewInit {

  public eventos: any[] = [];
  public isLoading: boolean = false;

  // Material Table
  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.eventos);

    // Configurar columnas según el rol
    this.configurarColumnas();

    // Configurar ordenamiento personalizado solo por nombre
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'nombre':
          return item.nombre_evento?.toLowerCase() || '';
        default:
          return item[property];
      }
    };

    // Configurar filtro personalizado - solo busca por nombre
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (data.nombre_evento?.toLowerCase() || '').includes(searchStr);
    };
  }

  private configurarColumnas(): void {
    const userRole = this.facadeService.getUserGroup();

    // Columnas base que todos ven
    const columnasBase = ['nombre', 'tipo', 'fecha', 'hora_inicio', 'hora_fin', 'lugar', 'publico_objetivo', 'programa_educativo', 'responsable', 'cupo_maximo'];

    // Solo administradores ven la columna de acciones ya que los alumnos y maestros no pueden editar/eliminar eventos
    if (userRole === 'Administrador') {
      this.displayedColumns = [...columnasBase, 'acciones'];
    } else {
      this.displayedColumns = columnasBase;
    }
  }

  ngOnInit(): void {
    this.obtenerEventos();
  }

  ngAfterViewInit() {
    // Paginator y sort se asignan después de cargar datos
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public obtenerEventos(): void {
    this.isLoading = true;

    const token = this.facadeService.getSessionToken();
    const userRole = this.facadeService.getUserGroup();
    console.log("Token actual:", token ? "Existe" : "NO existe");
    console.log("Rol de usuario:", userRole);

    this.eventosService.getEventos().subscribe(
      (response) => {
        console.log("Eventos obtenidos:", response);

        if (response && response.eventos && response.eventos.length > 0) {
          let eventosFiltrados = response.eventos.map((evento: any) => {
            // Convertir horas de HH:mm:ss a HH:mm
            if (evento.hora_inicio) {
              evento.hora_inicio = evento.hora_inicio.substring(0, 5);
            }
            if (evento.hora_fin) {
              evento.hora_fin = evento.hora_fin.substring(0, 5);
            }
            return evento;
          });

          // Filtrar eventos según el rol del usuario
          eventosFiltrados = this.filtrarEventosPorRol(eventosFiltrados, userRole);

          this.eventos = eventosFiltrados;
          this.dataSource.data = this.eventos;

          // Asignar paginator y sort después de que los datos carguen
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else {
          console.warn("La respuesta está vacía o no contiene eventos");
          this.eventos = [];
          this.dataSource.data = [];
        }

        this.isLoading = false;
      },
      (error) => {
        console.error("Error al obtener eventos:", error);
        console.error("Status:", error.status);
        console.error("Message:", error.message);

        this.isLoading = false;

        if (error.status === 0) {
          alert("ERROR: No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
        } else if (error.status === 401) {
          alert("No tienes permisos para ver esta información. Tu sesión puede haber expirado. Inicia sesión nuevamente.");
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          alert("Acceso prohibido. No tienes permisos para ver eventos.");
        } else {
          alert(`Error al obtener la lista de eventos. Status: ${error.status}`);
        }
      }
    );
  }

  private filtrarEventosPorRol(eventos: any[], userRole: string): any[] {
    // Administradores ven todos los eventos
    if (userRole === 'Administrador') {
      return eventos;
    }

    // Filtrar eventos según el rol
    return eventos.filter(evento => {
      try {
        // Parsear el público objetivo
        let publicoObjetivo: string[] = [];

        if (typeof evento.publico_objetivo === 'string') {
          let parsed = JSON.parse(evento.publico_objetivo);
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
          publicoObjetivo = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(evento.publico_objetivo)) {
          publicoObjetivo = evento.publico_objetivo;
        }

        // Verificar si el evento es para público general
        const esPublicoGeneral = publicoObjetivo.includes('Público general');

        // los Maestros ven: eventos para profesores o público general
        if (userRole === 'Maestro') {
          return publicoObjetivo.includes('Profesores') || esPublicoGeneral;
        }

        // los Alumnos ven: eventos para estudiantes o público general
        if (userRole === 'Alumno') {
          return publicoObjetivo.includes('Estudiantes') || esPublicoGeneral;
        }

        return false;
      } catch (error) {
        console.error('Error al filtrar evento:', evento, error);
        return false;
      }
    });
  }

  public editarEvento(evento: any): void {
    // Navegar a la página de edición pasando el ID
    this.router.navigate(['/registro-eventos'], {
      queryParams: {
        id: evento.id
      }
    });
  }

  public eliminarEvento(evento: any): void {
    // Validar permisos - solo administradores pueden eliminar eventos
    const userRole = this.facadeService.getUserGroup();

    if (userRole !== 'Administrador') {
      alert('No tienes permiso para eliminar eventos.');
      return;
    }

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EliminarEventoModalComponent, {
      width: '400px',
      data: {
        id: evento.id,
        nombre: evento.nombre_evento
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        // Llamar al servicio para eliminar
        this.eventosService.eliminarEvento(evento.id).subscribe(
          (response) => {
            console.log('Evento eliminado exitosamente:', response);
            alert(`Evento "${evento.nombre_evento}" eliminado correctamente`);
            this.obtenerEventos(); // Recargar la lista
          },
          (error) => {
            console.error('Error al eliminar evento:', error);
            if (error.status === 403) {
              alert('No tienes permisos para eliminar este evento.');
            } else if (error.status === 404) {
              alert('El evento no fue encontrado.');
            } else {
              alert('Error al eliminar el evento. Inténtalo nuevamente.');
            }
          }
        );
      }
    });
  }

  public formatPublicoObjetivo(publicoObjetivo: string): string {
    try {
      if (typeof publicoObjetivo === 'string') {
        const parsed = JSON.parse(publicoObjetivo);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
      }
      return publicoObjetivo;
    } catch (error) {
      return publicoObjetivo;
    }
  }
}
