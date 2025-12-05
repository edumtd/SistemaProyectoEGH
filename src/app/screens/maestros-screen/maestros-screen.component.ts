import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUsuarioModalComponent } from 'src/app/modals/eliminar-usuario-modal/eliminar-usuario-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit, AfterViewInit {

  public maestros: any[] = [];
  public isLoading: boolean = false;

  // Material Table
  displayedColumns: string[] = ['id', 'nombre', 'email', 'telefono', 'rfc', 'cubiculo', 'area', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort!: MatSort;

  constructor(
    public maestrosService: MaestrosService,
    public facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.maestros);

    // Configurar ordenamiento personalizado para datos anidados
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'id':
          return item.clave_maestro || '';
        case 'nombre':
          return `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.toLowerCase();
        case 'email':
          return item.user?.email?.toLowerCase() || '';
        case 'telefono':
          return item.telefono?.toLowerCase() || '';
        case 'rfc':
          return item.rfc?.toLowerCase() || '';
        case 'cubiculo':
          return item.cubiculo?.toLowerCase() || '';
        case 'area':
          return item.area_investigacion?.toLowerCase() || '';
        default:
          return item[property];
      }
    };

    // Configurar filtro personalizado para datos anidados
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.clave_maestro?.toString().toLowerCase() || '').includes(searchStr) ||
        (data.user?.first_name?.toLowerCase() || '').includes(searchStr) ||
        (data.user?.last_name?.toLowerCase() || '').includes(searchStr) ||
        (data.user?.email?.toLowerCase() || '').includes(searchStr) ||
        (data.telefono?.toLowerCase() || '').includes(searchStr) ||
        (data.rfc?.toLowerCase() || '').includes(searchStr) ||
        (data.cubiculo?.toLowerCase() || '').includes(searchStr) ||
        (data.area_investigacion?.toLowerCase() || '').includes(searchStr)
      );
    };
  }

  ngOnInit(): void {
    this.obtenerMaestros();
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

  public obtenerMaestros(): void {
    this.isLoading = true;

    this.maestrosService.obtenerMaestros().subscribe(
      (response) => {
        console.log("Maestros obtenidos:", response);
        console.log("Total de maestros:", response ? response.length : 0);

        if (response && response.length > 0) {
          this.maestros = response;
          this.dataSource.data = this.maestros;

          // Asignar paginator y sort después de que los datos carguen y el DOM se actualice
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else {
          console.warn("La respuesta está vacía o no contiene datos");
          this.maestros = [];
          this.dataSource.data = [];
        }

        this.isLoading = false;
      },
      (error) => {
        console.error("Error al obtener maestros:", error);
        console.error("Status:", error.status);
        console.error("Message:", error.message);
        console.error("Error completo:", error);

        this.isLoading = false;

        if(error.status === 0){
          alert("ERROR: No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
        } else if(error.status === 401){
          alert("No tienes permisos para ver esta información. Tu sesión puede haber expirado. Inicia sesión nuevamente.");
          this.router.navigate(['/login']);
        } else if(error.status === 403){
          alert("Acceso prohibido. No tienes permisos para ver maestros.");
        } else {
          alert(`Error al obtener la lista de maestros. Status: ${error.status}`);
        }
      }
    );
  }

  public editarMaestro(maestro: any): void {
    this.router.navigate(['/registro-usuarios'], {
      queryParams: {
        id: maestro.id,
        tipo: 'maestro',
        editar: true
      }
    });
  }

  public eliminarMaestro(maestro: any): void {
    // Obtener rol y ID del usuario actual
    const userRole = this.facadeService.getUserGroup();
    const currentUserId = parseInt(this.facadeService.getUserId());

    console.log('Usuario actual ID:', currentUserId);
    console.log('Maestro ID:', maestro.id);
    console.log('Maestro User ID:', maestro.user?.id);
    console.log('Rol del usuario:', userRole);

    // Validar permisos
    if (userRole === 'Maestro') {
      // El maestro solo puede eliminar su propio registro
      // Comparar con maestro.user.id (el ID del usuario en la tabla User)
      if (maestro.user?.id !== currentUserId) {
        alert('No tienes permiso para eliminar este maestro. Solo puedes eliminar tu propio registro.');
        return;
      }
    }

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EliminarUsuarioModalComponent, {
      width: '400px',
      data: {
        id: maestro.id,
        nombre: `${maestro.user.first_name} ${maestro.user.last_name}`,
        tipo: 'maestro'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        // Llamar al servicio para eliminar
        this.maestrosService.eliminarMaestro(maestro.id).subscribe(
          (response) => {
            console.log('Maestro eliminado exitosamente:', response);
            alert(`Maestro "${maestro.user.first_name} ${maestro.user.last_name}" eliminado correctamente`);
            this.obtenerMaestros(); // Recargar la lista
          },
          (error) => {
            console.error('Error al eliminar maestro:', error);
            if (error.status === 403) {
              alert('No tienes permisos para eliminar este maestro.');
            } else if (error.status === 404) {
              alert('El maestro no fue encontrado.');
            } else {
              alert('Error al eliminar el maestro. Inténtalo nuevamente.');
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
