import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public expandedMenu: string | null = null;
  public userInitial: string = '';
  public isMobileView: boolean = window.innerWidth <= 992;
  public showUserMenu: boolean = false;
  public mobileOpen: boolean = false;
  public userRole: string = '';
  public eventosDropdownOpen: boolean = false;

  paletteMode: 'light' | 'dark' = 'light';
  colorPalettes = {
    light: {
      '--background-main': '#f4f7fb',
      '--sidebar-bg': '#23395d',
      '--navbar-bg': '#fff',
      '--text-main': '#222',
      '--table-bg': '#fff',
      '--table-header-bg': '#cfe2ff',
    },
    dark: {
      '--background-main': '#181a1b',
      '--sidebar-bg': '#1a2636',
      '--navbar-bg': '#1a2636',
      '--text-main': '#f5f6fa',
      '--table-bg': '#222326',
      '--table-header-bg': '#30507a',
    }
  };

  togglePalette() {
    this.paletteMode = this.paletteMode === 'light' ? 'dark' : 'light';
    const palette = this.colorPalettes[this.paletteMode];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key as keyof typeof palette]);
    });
  }

  constructor(private router: Router, private facadeService: FacadeService) {
    const name = this.facadeService.getUserCompleteName();
    if (name && name.length > 0) {
      this.userInitial = name.trim()[0].toUpperCase();
    } else {
      this.userInitial = '?';
    }
    this.userRole = this.facadeService.getUserGroup();
    window.addEventListener('resize', () => {
      this.isMobileView = window.innerWidth <= 992;
      if (!this.isMobileView) {
        this.mobileOpen = false;
      }
    });
    this.paletteMode = 'light';
    const palette = this.colorPalettes['light'];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key as keyof typeof palette]);
    });
  }

  ngOnInit(): void {
    console.log('User Role:', this.userRole);
    console.log('Is Admin:', this.isAdmin());
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobileView = window.innerWidth <= 992;
    if (!this.isMobileView) {
      this.mobileOpen = false;
    }
  }

  toggleSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar() {
    this.mobileOpen = false;
  }

  toggleEventosDropdown() {
    this.eventosDropdownOpen = !this.eventosDropdownOpen;
  }

  logout() {
    this.facadeService.destroyUser();
    this.router.navigate(['/login']);
    this.closeSidebar();
  }

  isAdmin(): boolean {
    return this.userRole === 'Administrador';
  }
  isTeacher(): boolean {
    return this.userRole === 'Maestro';
  }
  isStudent(): boolean {
    return this.userRole === 'Alumno';
  }
  canSeeAdminItems(): boolean {
    return this.isAdmin();
  }
  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isTeacher() || this.isStudent();
  }
  canSeeHomeItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
  canSeeRegisterItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

}
