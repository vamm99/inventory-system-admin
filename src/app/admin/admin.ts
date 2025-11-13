import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/service/auth.service';
import { 
  LucideAngularModule, 
  Settings, 
  CreditCard, 
  LayoutGrid, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Truck, 
  User,
  ChevronDown,
  Menu,
  DoorOpen
} from 'lucide-angular';

interface MenuItem {
  label: string;
  path: string;
  icon: any;
}

interface DropdownItem {
  label: string;
  action?: () => void;
  path?: string;
}

@Component({
  selector: 'app-admin',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private authService: AuthService = inject(AuthService);

  // Estado del sidebar móvil
  isSidebarOpen = false;

  // Registramos los iconos a usar 
  icons = {
    doorOpen: DoorOpen,
    home: Settings,
    barcode: CreditCard,
    category: LayoutGrid,
    deshe: Package,
    inventory: Warehouse,
    product: ShoppingCart,
    provider: Truck,
    account: User,
    chevronDown: ChevronDown,
    menu: LayoutGrid // Icono para el botón del menú móvil
  };

  // Definimos los items del menú
  menuItems: MenuItem[] = [
    { label: 'Inicio', path: '/admin/home', icon: this.icons.home },
    { label: 'Egresos', path: '/admin/expenses', icon: this.icons.doorOpen },
    { label: 'Código de barras', path: '/admin/barcode', icon: this.icons.barcode },
    { label: 'Categoría', path: '/admin/category', icon: this.icons.category },
    // { label: 'Deshe', path: '/admin/deshe', icon: this.icons.deshe },
    { label: 'Inventario', path: '/admin/inventory', icon: this.icons.inventory },
    { label: 'Producto', path: '/admin/product', icon: this.icons.product },
    { label: 'Proveedor', path: '/admin/provider', icon: this.icons.provider },
  ];

  // Items del dropdown de Account
  accountDropdownItems: DropdownItem[] = [
    {
      label: 'Detalles',
      path: '#'
    },
    {
      label: 'Cerrar Sesión',
      action: () => this.onLogout()
    }
  ];

  // Método para cerrar sesión
  onLogout(): void {
    this.authService.logout();
  }

  // Método para manejar clicks en items del dropdown
  handleDropdownClick(item: DropdownItem, event: Event): void {
    if (item.action) {
      event.preventDefault();
      item.action();
    }
  }

  // Método para toggle del sidebar en móvil
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}