// ============================================================================
// GUÍA COMPLETA DE USO - EJEMPLO PRÁCTICO
// ============================================================================

/\*\*

- CASO: Agregar un nuevo Feature "Merchandise Store"
-
- Objetivo: Crear un slice para vender merchandise del proyecto
- Pasos para seguir la arquitectura
  \*/

// ============================================================================
// PASO 1: Crear Modelo de Dominio
// ============================================================================

// src/app/features/merchandise/domain/merchandise.model.ts

export interface MerchandiseProduct {
id: string;
name: string;
price: number;
currency: 'USD' | 'EUR';
image: string;
category: 'clothing' | 'accessories' | 'digital';
inStock: boolean;
}

export interface MerchandiseOrder {
orderId: string;
products: MerchandiseProduct[];
totalPrice: number;
status: 'pending' | 'shipped' | 'delivered';
}

// ============================================================================
// PASO 2: Crear Puerto (Repository Abstracto)
// ============================================================================

// src/app/features/merchandise/domain/merchandise.repository.ts

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class MerchandiseRepository {
abstract getProducts(): Promise<MerchandiseProduct[]>;

abstract createOrder(products: MerchandiseProduct[]): Promise<MerchandiseOrder>;

abstract getOrderStatus(orderId: string): Promise<MerchandiseOrder>;
}

// ============================================================================
// PASO 3: Crear Adaptador (Implementación Concreta)
// ============================================================================

// src/app/features/merchandise/infrastructure/http-merchandise.adapter.ts

import { Injectable } from '@angular/core';
import { MerchandiseRepository } from '../../domain/merchandise.repository';
import { MerchandiseProduct, MerchandiseOrder } from '../../domain/merchandise.model';

@Injectable({ providedIn: 'root' })
export class HttpMerchandiseAdapter extends MerchandiseRepository {
constructor() {
super();
// En producción: private http: HttpClient
}

async getProducts(): Promise<MerchandiseProduct[]> {
// Mock: En producción sería HTTP GET /api/merchandise/products
return [
{
id: 'merch_1',
name: 'FLOWMIX T-Shirt',
price: 29.99,
currency: 'USD',
image: 'https://example.com/tshirt.jpg',
category: 'clothing',
inStock: true,
},
];
}

async createOrder(products: MerchandiseProduct[]): Promise<MerchandiseOrder> {
// Mock: HTTP POST /api/orders
const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
return {
orderId: `order_${Date.now()}`,
products,
totalPrice,
status: 'pending',
};
}

async getOrderStatus(orderId: string): Promise<MerchandiseOrder> {
// Mock: HTTP GET /api/orders/{orderId}
return {
orderId,
products: [],
totalPrice: 0,
status: 'shipped',
};
}
}

// ============================================================================
// PASO 4: Crear Use Cases (Orquestación de Lógica)
// ============================================================================

// src/app/features/merchandise/application/get-products.use-case.ts

import { Injectable, signal } from '@angular/core';
import { MerchandiseRepository } from '../../domain/merchandise.repository';
import { MerchandiseProduct } from '../../domain/merchandise.model';

@Injectable({ providedIn: 'root' })
export class GetProductsUseCase {
private readonly loadingSignal = signal(false);
private readonly errorSignal = signal<string | null>(null);
private readonly productsSignal = signal<MerchandiseProduct[]>([]);

loading = this.loadingSignal.asReadonly();
error = this.errorSignal.asReadonly();
products = this.productsSignal.asReadonly();

constructor(private merchandiseRepository: MerchandiseRepository) {}

async execute(): Promise<void> {
this.loadingSignal.set(true);
this.errorSignal.set(null);

    try {
      const products = await this.merchandiseRepository.getProducts();
      this.productsSignal.set(products);
    } catch (error) {
      this.errorSignal.set(
        error instanceof Error ? error.message : 'No se pudieron cargar los productos'
      );
    } finally {
      this.loadingSignal.set(false);
    }

}
}

// src/app/features/merchandise/application/create-order.use-case.ts

import { Injectable, signal } from '@angular/core';
import { MerchandiseRepository } from '../../domain/merchandise.repository';
import { MerchandiseOrder, MerchandiseProduct } from '../../domain/merchandise.model';

@Injectable({ providedIn: 'root' })
export class CreateOrderUseCase {
private readonly loadingSignal = signal(false);
private readonly errorSignal = signal<string | null>(null);
private readonly orderSignal = signal<MerchandiseOrder | null>(null);

loading = this.loadingSignal.asReadonly();
error = this.errorSignal.asReadonly();
order = this.orderSignal.asReadonly();

constructor(private merchandiseRepository: MerchandiseRepository) {}

async execute(products: MerchandiseProduct[]): Promise<void> {
if (products.length === 0) {
this.errorSignal.set('El carrito está vacío');
return;
}

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const order = await this.merchandiseRepository.createOrder(products);
      this.orderSignal.set(order);
    } catch (error) {
      this.errorSignal.set(
        error instanceof Error ? error.message : 'Error al crear la orden'
      );
    } finally {
      this.loadingSignal.set(false);
    }

}
}

// ============================================================================
// PASO 5: Crear Componentes Presentacionales (Dumb)
// ============================================================================

// src/app/features/merchandise/infrastructure/ui/product-card/product-card.component.ts

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchandiseProduct } from '../../domain/merchandise.model';

@Component({
selector: 'app-product-card',
standalone: true,
imports: [CommonModule],
template: `     <div class="glass p-6 rounded-3xl neon-glow-cyan hover:scale-105 transition-transform cursor-pointer"
         (click)="onSelect.emit()">
      <img [src]="product().image" [alt]="product().name" class="w-full h-48 object-cover rounded-2xl mb-4"/>
      <h3 class="text-lg font-bold monotech">{{ product().name }}</h3>
      <p class="text-white/60 text-sm mb-4">{{ product().category }}</p>
      <div class="flex justify-between items-center">
        <span class="text-2xl font-black text-primary">
          ${{ product().price }}
        </span>
        <button [disabled]="!product().inStock"
                class="px-4 py-2 bg-primary text-black rounded-lg font-bold disabled:opacity-50">
          {{ product().inStock ? 'COMPRAR' : 'AGOTADO' }}
        </button>
      </div>
    </div>
  `,
styles: [],
})
export class ProductCardComponent {
product = input.required<MerchandiseProduct>();
onSelect = output<void>();
}

// src/app/features/merchandise/infrastructure/ui/shopping-cart/shopping-cart.component.ts

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchandiseProduct } from '../../domain/merchandise.model';

@Component({
selector: 'app-shopping-cart',
standalone: true,
imports: [CommonModule],
template: `     <div class="glass p-8 rounded-3xl max-w-md">
      <h2 class="text-2xl font-black monotech mb-6">CARRITO</h2>
      <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
        <ng-container *ngFor="let item of cartItems()">
          <div class="flex justify-between items-center pb-2 border-b border-white/10">
            <span>{{ item.name }}</span>
            <button (click)="onRemove.emit(item.id)" 
                    class="text-red-400 hover:text-red-300">✕</button>
          </div>
        </ng-container>
      </div>
      <div class="text-xl font-black mb-6">
        Total: ${{ totalPrice() }}
      </div>
      <button (click)="onCheckout.emit()"
              [disabled]="cartItems().length === 0"
              class="w-full py-4 bg-primary text-black rounded-xl font-black uppercase disabled:opacity-50">
        PROCESAR PAGO
      </button>
    </div>
  `,
styles: [],
})
export class ShoppingCartComponent {
cartItems = input.required<MerchandiseProduct[]>();
onRemove = output<string>();
onCheckout = output<void>();

totalPrice() {
return this.cartItems().reduce((sum, p) => sum + p.price, 0).toFixed(2);
}
}

// ============================================================================
// PASO 6: Crear Container (Smart Component)
// ============================================================================

// src/app/features/merchandise/merchandise.container.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { GetProductsUseCase } from './get-products.use-case';
import { CreateOrderUseCase } from './create-order.use-case';
import { HttpMerchandiseAdapter } from '../infrastructure/http-merchandise.adapter';
import { MerchandiseRepository } from '../domain/merchandise.repository';
import { ProductCardComponent } from '../infrastructure/ui/product-card/product-card.component';
import { ShoppingCartComponent } from '../infrastructure/ui/shopping-cart/shopping-cart.component';
import { MerchandiseProduct } from '../domain/merchandise.model';

@Component({
selector: 'app-merchandise-container',
standalone: true,
imports: [CommonModule, ProductCardComponent, ShoppingCartComponent],
providers: [
{ provide: MerchandiseRepository, useClass: HttpMerchandiseAdapter },
GetProductsUseCase,
CreateOrderUseCase,
],
template: `
<section class="space-y-12 py-16">
<header class="text-center space-y-4">
<h2 class="text-5xl font-black monotech uppercase">MERCHANDISE</h2>
<p class="text-white/60">Apoya el proyecto, obtén merchandise exclusivo</p>
</header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Productos -->
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ng-container *ngIf="getProducts.products()?.length">
            <ng-container *ngFor="let product of getProducts.products()">
              <app-product-card [product]="product"
                              (onSelect)="addToCart(product)"/>
            </ng-container>
          </ng-container>
          <div *ngIf="getProducts.loading()" class="col-span-full text-center text-white/40">
            CARGANDO PRODUCTOS...
          </div>
        </div>

        <!-- Carrito -->
        <app-shopping-cart [cartItems]="cart()"
                         (onRemove)="removeFromCart($event)"
                         (onCheckout)="checkout()"/>
      </div>

      <!-- Confirmación de orden -->
      <div *ngIf="createOrder.order()" class="glass p-8 rounded-3xl text-center">
        <span class="text-green-400 material-symbols-outlined text-6xl">check_circle</span>
        <h3 class="text-2xl font-black mt-4">¡ORDEN CREADA!</h3>
        <p class="text-white/60 mt-2">ID: {{ createOrder.order()?.orderId }}</p>
      </div>
    </section>

`,
styles: [],
})
export class MerchandiseContainerComponent implements OnInit {
getProducts = inject(GetProductsUseCase);
createOrder = inject(CreateOrderUseCase);

private cartSignal = signal<MerchandiseProduct[]>([]);
cart = this.cartSignal.asReadonly();

ngOnInit(): void {
this.getProducts.execute();
}

addToCart(product: MerchandiseProduct): void {
const currentCart = this.cartSignal();
this.cartSignal.set([...currentCart, product]);
}

removeFromCart(productId: string): void {
const currentCart = this.cartSignal();
this.cartSignal.set(currentCart.filter(p => p.id !== productId));
}

async checkout(): Promise<void> {
await this.createOrder.execute(this.cartSignal());
if (!this.createOrder.error()) {
this.cartSignal.set([]); // Limpiar carrito
}
}
}

// ============================================================================
// PASO 7: Usar en App Component
// ============================================================================

// src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchandiseContainerComponent } from './features/merchandise/merchandise.container';
// ... otros imports

@Component({
selector: 'app-root',
standalone: true,
imports: [
CommonModule,
// ... otros componentes
MerchandiseContainerComponent,
],
template: `     <div class="dark bg-[#050505] min-h-screen">
      <!-- ... otros contenidos -->
      <app-merchandise-container />
    </div>
  `,
})
export class AppComponent {}

// ============================================================================
// PASO 8: Testing
// ============================================================================

// src/app/features/merchandise/application/get-products.use-case.spec.ts

import { TestBed } from '@angular/core/testing';
import { GetProductsUseCase } from './get-products.use-case';
import { MerchandiseRepository } from '../domain/merchandise.repository';
import { MerchandiseProduct } from '../domain/merchandise.model';

describe('GetProductsUseCase', () => {
let useCase: GetProductsUseCase;
let mockRepository: jasmine.SpyObj<MerchandiseRepository>;

const mockProducts: MerchandiseProduct[] = [
{
id: 'test_1',
name: 'Test Product',
price: 29.99,
currency: 'USD',
image: 'test.jpg',
category: 'clothing',
inStock: true,
},
];

beforeEach(() => {
mockRepository = jasmine.createSpyObj('MerchandiseRepository', ['getProducts']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MerchandiseRepository, useValue: mockRepository },
        GetProductsUseCase,
      ],
    });

    useCase = TestBed.inject(GetProductsUseCase);

});

it('debería cargar productos correctamente', async () => {
mockRepository.getProducts.and.returnValue(Promise.resolve(mockProducts));

    await useCase.execute();

    expect(useCase.products()).toEqual(mockProducts);
    expect(useCase.loading()).toBe(false);

});

it('debería manejar errores correctamente', async () => {
const error = new Error('Error de conexión');
mockRepository.getProducts.and.returnValue(Promise.reject(error));

    await useCase.execute();

    expect(useCase.error()).toBe('Error de conexión');
    expect(useCase.products()).toEqual([]);

});
});

// ============================================================================
// RESUMEN: FLUJO DE DATOS
// ============================================================================

/\*\*

- Usuario interactúa con ProductCardComponent
-         ↓
- onSelect evento → MerchandiseContainerComponent
-         ↓
- addToCart() actualiza cart signal
-         ↓
- ShoppingCartComponent recibe datos vía @input
-         ↓
- Usuario hace click en "PROCESAR PAGO"
-         ↓
- checkout() → CreateOrderUseCase.execute()
-         ↓
- CreateOrderUseCase inyecta MerchandiseRepository
-         ↓
- En test: mockRepository, En producción: HttpMerchandiseAdapter
-         ↓
- Repository hace llamada HTTP (o mock)
-         ↓
- Resultado actualiza signal order()
-         ↓
- Template reactivo se actualiza automáticamente
  \*/
