import { Component, Input, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit, OnChanges {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public admin:any = {
    clave_admin: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmar_password: '',
    fecha_nacimiento: null,
    telefono: '',
    rfc: ''
  };
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Detectar si viene desde el modo editar
    this.activatedRoute.queryParams.subscribe(params => {
      if(params['id'] && params['editar']){
        this.editar = true;
        this.idUser = parseInt(params['id']);
        console.log("MODO EDITAR - ID User:", this.idUser);

        // Si datos_user viene del parent, lo usamos
        if(this.datos_user && Object.keys(this.datos_user).length > 0){
          console.log("Datos recibidos del padre:", this.datos_user);

          // Actualizar propiedades del objeto existente
          this.admin.clave_admin = this.datos_user.clave_admin || '';
          this.admin.first_name = this.datos_user.first_name || this.datos_user.user?.first_name || '';
          this.admin.last_name = this.datos_user.last_name || this.datos_user.user?.last_name || '';
          this.admin.email = this.datos_user.email || this.datos_user.user?.email || '';
          this.admin.fecha_nacimiento = this.datos_user.fecha_nacimiento ? new Date(this.datos_user.fecha_nacimiento) : null;
          this.admin.telefono = this.datos_user.telefono || '';
          this.admin.rfc = this.datos_user.rfc || '';
          this.admin.edad = this.datos_user.edad || '';
          this.admin.ocupacion = this.datos_user.ocupacion || '';

          // Forzar detección de cambios
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        }else{
          // Sino, cargamos desde el servicio
          this.cargarAdmin();
        }
      }else{
        // Modo registro normal
        this.admin = this.administradoresService.esquemaAdmin();
        this.admin.rol = this.rol;
        this.token = this.facadeService.getSessionToken();
      }
    });
    console.log("Admin después de ngOnInit:", this.admin);
  }

  ngOnChanges(): void {
    // Detectar cambios en datos_user cuando viene del padre
    if(this.datos_user && Object.keys(this.datos_user).length > 0){
      console.log("Datos actualizados del padre:", this.datos_user);

      // Actualizar propiedades del objeto existente
      this.admin.clave_admin = this.datos_user.clave_admin || '';
      this.admin.first_name = this.datos_user.first_name || this.datos_user.user?.first_name || '';
      this.admin.last_name = this.datos_user.last_name || this.datos_user.user?.last_name || '';
      this.admin.email = this.datos_user.email || this.datos_user.user?.email || '';
      this.admin.fecha_nacimiento = this.datos_user.fecha_nacimiento ? new Date(this.datos_user.fecha_nacimiento) : null;
      this.admin.telefono = this.datos_user.telefono || '';
      this.admin.rfc = this.datos_user.rfc || '';
      this.admin.edad = this.datos_user.edad || '';
      this.admin.ocupacion = this.datos_user.ocupacion || '';

      console.log("Admin actualizado:", this.admin);

      // Forzar detección de cambios
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  private cargarAdmin(): void {
    this.facadeService.obtenerAdminPorId(Number(this.idUser)).subscribe({
      next: (response) => {
        console.log("Admin cargado para editar:", response);

        // Actualizar propiedades del objeto existente
        this.admin.clave_admin = response.clave_admin || '';
        this.admin.first_name = response.user?.first_name || '';
        this.admin.last_name = response.user?.last_name || '';
        this.admin.email = response.user?.email || '';
        this.admin.fecha_nacimiento = response.fecha_nacimiento ? new Date(response.fecha_nacimiento) : null;
        this.admin.telefono = response.telefono || '';
        this.admin.rfc = response.rfc || '';
        this.admin.edad = response.edad || '';
        this.admin.ocupacion = response.ocupacion || '';

        console.log("Admin mapeado:", this.admin);

        // Forzar detección de cambios
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error("Error al cargar admin:", error);
        alert("Error al cargar los datos");
        this.regresar();
      }
    });
  }

  public regresar(){
    this.location.back();
  }

  //Funciones para password
  public showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public registrar(){
    console.log("Datos del admin:", this.admin);

    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      console.error("ERRORES DE VALIDACIÓN:", this.errors);
      return false;
    }

    // Validar si las contraseñas coinciden
    if(this.admin.password != this.admin.confirmar_password){
      alert('Las contraseñas no coinciden');
      console.error("ERROR: Las contraseñas no coinciden");
      return false;
    }

    console.log("Validación exitosa");
    console.log("Datos a enviar:", JSON.stringify(this.admin, null, 2));
    console.log("URL del API:", `${environment.url_api}/api/administrador/registro/`);

    // Consumir servicio para registrar administradores
    this.administradoresService.registrarAdmin(this.admin).subscribe({
      next: (response:any) => {
        console.log("ÉXITO - Admin registrado:", response);
        alert('Administrador registrado con éxito. ID: ' + (response.admin_created_id || response.id));

        //Validar si se registro que entonces navegue a la lista de administradores
        if(this.token != ""){
          this.router.navigate(['administrador']);
        }else{
          this.router.navigate(['/']);
        }
      },
      error: (error:any) => {
        console.error("ERROR COMPLETO:", error);
        console.error("Status:", error.status);
        console.error("Error body:", error.error);

        if(error.status === 0){
          alert(`ERROR: No se puede conectar con el servidor. Asegúrate de que el backend esté corriendo en ${environment.url_api}`);
        } else if(error.status === 422){
          this.errors = error.error.errors;
        } else if(error.error && error.error.message){
          alert("Error: " + error.error.message);
        } else {
          alert('Error al registrar el administrador. Revisa la consola para más detalles.');
        }
      }
    });
  }

  public actualizar(){
    console.log("=== INICIANDO ACTUALIZACIÓN DE ADMINISTRADOR ===");
    console.log("ID:", this.idUser);
    console.log("Datos del admin:", this.admin);

    this.errors = {};

    // Validar campos (sin validar contraseña si no se cambió)
    if(!this.admin.first_name){
      this.errors.first_name = "El nombre es requerido";
    }
    if(!this.admin.last_name){
      this.errors.last_name = "Los apellidos son requeridos";
    }
    if(!this.admin.email){
      this.errors.email = "El correo es requerido";
    }

    // Validar contraseña solo si se ingresó una nueva
    if(this.admin.password && this.admin.password !== this.admin.confirmar_password){
      alert('Las contraseñas no coinciden');
      return false;
    }

    if(Object.keys(this.errors).length > 0){
      console.error("ERRORES DE VALIDACIÓN:", this.errors);
      alert("Por favor completa todos los campos requeridos");
      return false;
    }

    // Preparar datos para actualizar
    let dataToUpdate: any = {
      first_name: this.admin.first_name,
      last_name: this.admin.last_name,
      email: this.admin.email,
      clave_admin: this.admin.clave_admin || null,
      fecha_nacimiento: this.admin.fecha_nacimiento || null,
      telefono: this.admin.telefono || null,
      rfc: this.admin.rfc || null,
      edad: this.admin.edad || null,
      ocupacion: this.admin.ocupacion || null
    };

    // Solo incluir password si se ingresó uno nuevo
    if(this.admin.password){
      dataToUpdate.password = this.admin.password;
    }

    console.log("Validación exitosa");
    console.log("Datos a actualizar:", JSON.stringify(dataToUpdate, null, 2));

    this.facadeService.actualizarAdmin(Number(this.idUser), dataToUpdate).subscribe({
      next: (response) => {
        // Si el backend retorna un nuevo token, actualizarlo sin cambiar la sesión del usuario actual
        if(response.token){
          this.facadeService.updateSessionToken(response.token);
        }

        alert('Administrador actualizado con éxito');
        this.router.navigate(['administradores']);
      },
      error: (error) => {
        console.error("ERROR al actualizar:", error);

        if(error.status === 0){
          alert("ERROR: No se puede conectar con el servidor");
        }else if(error.status === 404){
          alert("ERROR: Administrador no encontrado");
        }else if(error.error && error.error.message){
          alert("Error: " + error.error.message);
        }else{
          alert('Error al actualizar el administrador');
        }
      }
    });
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

  // Función para permitir solo letras y números (ID y ocupación)
  public soloLetrasYNumeros(event: KeyboardEvent) {
    const pattern = /[a-zA-Z0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // Función para validar edad mayor a 18 años
  public validarEdad() {
    if (this.admin.edad) {
      const edad = parseInt(this.admin.edad);
      if (edad < 18) {
        this.errors.edad = 'La edad debe ser mayor o igual a 18 años';
      } else if (edad > 100) {
        this.errors.edad = 'Ingresa una edad válida';
      } else {
        delete this.errors.edad;
      }
    }
  }

  // Función para contar dígitos del teléfono
  public contarDigitosTelefono(): number {
    if (!this.admin.telefono) {
      return 0;
    }
    return this.admin.telefono.replace(/[^0-9]/g, '').length;
  }
}
