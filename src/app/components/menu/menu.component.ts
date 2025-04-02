import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  constructor(private authService: AuthService, private router: Router) {}

  menuVisible = false;
  touchStartX = 0;

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
    this.toggleBodyScroll();
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const diffX = this.touchStartX - touchEndX;
    
    if (this.menuVisible && diffX > 100) {
      this.toggleMenu();
    }
  }

  onSwipeLeft(): void {
    if (this.menuVisible) {
      this.toggleMenu();
    }
  }

  private toggleBodyScroll(): void {
    if (window.innerWidth < 992) {
      document.body.style.overflow = this.menuVisible ? 'hidden' : '';
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      console.log('Usuário deslogado com sucesso');
      this.router.navigate(['/Login']);
    }, error => {
      console.error('Erro ao deslogar:', error);
    });
  }
}
