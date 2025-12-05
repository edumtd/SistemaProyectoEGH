import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  roles?: string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public userRole: string = '';
  public menuItems: MenuItem[] = [];

  private allMenuItems: MenuItem[] = [
    {
      icon: 'person_add',
      label: 'Registro',
      route: '/registro-usuarios',
      roles: ['Administrador']
    },
    {
      icon: 'admin_panel_settings',
      label: 'Admins',
      route: '/administradores',
      roles: ['Administrador']
    },
    {
      icon: 'person',
      label: 'Maestros',
      route: '/maestros',
      roles: ['Administrador', 'Maestro']
    },
    {
      icon: 'school',
      label: 'Alumnos',
      route: '/alumnos',
      roles: ['Administrador', 'Maestro', 'Alumno']
    },
    {
      icon: 'bar_chart',
      label: 'Gráficas',
      route: '/graficas',
      roles: ['Administrador', 'Maestro']
    },
    {
      icon: 'event',
      label: 'Eventos Académicos',
      roles: ['Administrador', 'Maestro', 'Alumno'],
      expanded: false,
      children: [
        {
          icon: 'list',
          label: 'Ver Eventos',
          route: '/eventos-academicos',
          roles: ['Administrador', 'Maestro', 'Alumno']
        },
        {
          icon: 'add_circle',
          label: 'Registrar Evento',
          route: '/registro-eventos',
          roles: ['Administrador']
        }
      ]
    }
  ];

  constructor(
    public facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userRole = this.facadeService.getUserGroup() || '';
    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    this.menuItems = this.allMenuItems.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      // Si tiene hijos, filtrar los hijos según los roles
      if (item.children) {
        item.children = item.children.filter(child => {
          if (!child.roles || child.roles.length === 0) {
            return true;
          }
          return child.roles.includes(this.userRole);
        });
        // Solo mostrar el padre si tiene al menos un hijo visible
        return item.children.length > 0;
      }

      return item.roles.includes(this.userRole);
    });
  }

  public navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  public toggleDropdown(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  public isActive(route: string): boolean {
    return this.router.url === route;
  }
}
