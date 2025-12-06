import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EliminarUsuarioModalComponent } from 'src/app/modals/eliminar-usuario-modal/eliminar-usuario-modal.component';

@Component({
  selector: 'app-administradores-screen',
  templateUrl: './administradores-screen.component.html',
  styleUrls: ['./administradores-screen.component.scss']
})
export class AdministradoresScreenComponent implements OnInit {

  public administradores: any[] = [];
  public isLoading: boolean = false;

  constructor(
    public facadeService: FacadeService,
    public administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.obtenerAdministradores();
  }

  public obtenerAdministradores(): void {
    this.isLoading = true;

    this.facadeService.obtenerAdministradores().subscribe(
      (response) => {

        if (response && response.length > 0) {
          this.administradores = response;
        } else {
          console.warn("La respuesta está vacía o no contiene datos");
          this.administradores = [];
        }

        this.isLoading = false;
      },
      (error) => {
        console.error("Error al obtener administradores:", error);
        console.error("Status:", error.status);
        console.error("Message:", error.message);

        this.isLoading = false;

        if(error.status === 0){
          alert("ERROR: No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
        } else if(error.status === 401){
          alert("No tienes permisos para ver esta información. Tu sesión puede haber expirado. Inicia sesión nuevamente.");
          this.router.navigate(['/login']);
        } else if(error.status === 403){
          alert("Acceso prohibido. No tienes permisos para ver administradores.");
        } else {
          alert(`Error al obtener la lista de administradores. Status: ${error.status}`);
        }
      }
    );
  }

  public nuevoAdministrador(): void {
    this.router.navigate(['/registro-usuarios']);
  }

  public editarAdministrador(admin: any): void {
    // Navegar a la página de edición pasando el ID y el modo editar
    this.router.navigate(['/registro-usuarios'], {
      queryParams: {
        id: admin.id,
        tipo: 'administrador',
        editar: true
      }
    });
  }

  public eliminarAdministrador(admin: any): void {
    // Validar permisos - solo administradores pueden eliminar administradores
    const userRole = this.facadeService.getUserGroup();

    if (userRole === 'Maestro') {
      alert('No tienes permiso para eliminar administradores.');
      return;
    }

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(EliminarUsuarioModalComponent, {
      width: '400px',
      data: {
        id: admin.id,
        nombre: `${admin.user.first_name} ${admin.user.last_name}`,
        tipo: 'administrador'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        // Llamar al servicio para eliminar
        this.administradoresService.eliminarAdmin(admin.id).subscribe(
          (response) => {
            console.log('Administrador eliminado exitosamente:', response);
            alert(`Administrador "${admin.user.first_name} ${admin.user.last_name}" eliminado correctamente`);
            this.obtenerAdministradores(); // Recargar la lista
          },
          (error) => {
            console.error('Error al eliminar administrador:', error);
            if (error.status === 403) {
              alert('No tienes permisos para eliminar este administrador.');
            } else if (error.status === 404) {
              alert('El administrador no fue encontrado.');
            } else {
              alert('Error al eliminar el administrador. Inténtalo nuevamente.');
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
