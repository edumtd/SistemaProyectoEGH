import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUsuarioModalComponent } from 'src/app/modals/eliminar-usuario-modal/eliminar-usuario-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'telefono', 'rfc', 'ocupacion', 'acciones'];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;

  public alumnos: any[] = [];
  public isLoading: boolean = false;

  constructor(
    public alumnosService: AlumnosService,
    public facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.alumnos);

    // Configurar ordenamiento personalizado para datos anidados
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'nombre':
          return `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.toLowerCase();
        case 'email':
          return item.user?.email?.toLowerCase() || '';
        case 'matricula':
          return item.matricula?.toLowerCase() || '';
        case 'telefono':
          return item.telefono?.toLowerCase() || '';
        case 'rfc':
          return item.rfc?.toLowerCase() || '';
        case 'ocupacion':
          return item.ocupacion?.toLowerCase() || '';
        default:
          return item[property];
      }
    };

    // Configurar filtro personalizado para datos anidados
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.matricula?.toLowerCase() || '').includes(searchStr) ||
        (data.user?.first_name?.toLowerCase() || '').includes(searchStr) ||
        (data.user?.last_name?.toLowerCase() || '').includes(searchStr) ||
        (data.user?.email?.toLowerCase() || '').includes(searchStr) ||
        (data.telefono?.toLowerCase() || '').includes(searchStr) ||
        (data.rfc?.toLowerCase() || '').includes(searchStr) ||
        (data.ocupacion?.toLowerCase() || '').includes(searchStr)
      );
    };
  }

  ngOnInit(): void {
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
    // No hacer nada aquí - el paginator y sort se asignan después de cargar datos
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public obtenerAlumnos(): void {
    this.isLoading = true;

    this.alumnosService.obtenerAlumnos().subscribe(
      (response) => {
        console.log("Alumnos obtenidos:", response);
        console.log("Total de alumnos:", response ? response.length : 0);

        if (response && response.length > 0) {
          this.alumnos = response;
          this.dataSource.data = this.alumnos;

          // Asignar paginator y sort después de que los datos carguen y el DOM se actualice
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else {
          console.warn("La respuesta está vacía o no contiene datos");
          this.alumnos = [];
          this.dataSource.data = [];
        }

        this.isLoading = false;
      },
      (error) => {
        console.error("Error al obtener alumnos:", error);
        console.error("Status:", error.status);
        console.error("Message:", error.message);

        this.isLoading = false;

        if(error.status === 0){
          alert("ERROR: No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
        } else if(error.status === 401){
          alert("No tienes permisos para ver esta información. Tu sesión puede haber expirado. Inicia sesión nuevamente.");
          this.router.navigate(['/login']);
        } else if(error.status === 403){
          alert("Acceso prohibido. No tienes permisos para ver alumnos.");
        } else {
          alert(`Error al obtener la lista de alumnos. Status: ${error.status}`);
        }
      }
    );
  }

  public editarAlumno(alumno: any): void {
    this.router.navigate(['/registro-usuarios'], {
      queryParams: {
        id: alumno.id,
        tipo: 'alumno',
        editar: true
      }
    });
  }

  public eliminarAlumno(alumno: any): void {
    // Validar permisos - solo administradores pueden eliminar alumnos
    const userRole = this.facadeService.getUserGroup();

    if (userRole === 'Maestro') {
      alert('No tienes permiso para eliminar alumnos.');
      return;
    }

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EliminarUsuarioModalComponent, {
      width: '400px',
      data: {
        id: alumno.id,
        nombre: `${alumno.user.first_name} ${alumno.user.last_name}`,
        tipo: 'alumno'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        // Llamar al servicio para eliminar
        this.alumnosService.eliminarAlumno(alumno.id).subscribe(
          (response) => {
            console.log('Alumno eliminado exitosamente:', response);
            alert(`Alumno "${alumno.user.first_name} ${alumno.user.last_name}" eliminado correctamente`);
            this.obtenerAlumnos(); // Recargar la lista
          },
          (error) => {
            console.error('Error al eliminar alumno:', error);
            if (error.status === 403) {
              alert('No tienes permisos para eliminar este alumno.');
            } else if (error.status === 404) {
              alert('El alumno no fue encontrado.');
            } else {
              alert('Error al eliminar el alumno. Inténtalo nuevamente.');
            }
          }
        );
      }
    });
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
