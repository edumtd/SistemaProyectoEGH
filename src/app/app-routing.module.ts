import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { AdministradoresScreenComponent } from './screens/administradores-screen/administradores-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { GraficasScreenComponent } from './screens/graficas-screen/graficas-screen.component';
import { EventosAcademicosScreenComponent } from './screens/eventos-academicos-screen/eventos-academicos-screen.component';
import { RegistroEventosScreenComponent } from './screens/registro-eventos-screen/registro-eventos-screen.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginScreenComponent },
      { path: 'registro-usuarios', component: RegistroUsuariosScreenComponent }
    ]
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'administradores',
        component: AdministradoresScreenComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'maestros',
        component: MaestrosScreenComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Maestro'] }
      },
      {
        path: 'alumnos',
        component: AlumnosScreenComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Maestro', 'Alumno'] }
      },
      {
        path: 'graficas',
        component: GraficasScreenComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'eventos-academicos',
        component: EventosAcademicosScreenComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Maestro', 'Alumno'] }
      },
      {
        path: 'registro-eventos',
        component: RegistroEventosScreenComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
