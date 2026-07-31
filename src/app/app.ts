import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Bell, ChevronLeft, CircleUserRound, Compass, Menu, Plane, Radar, Search, ShieldCheck, X } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { filter, fromEvent, merge } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private previouslyFocused: HTMLElement | null = null;
  protected readonly mobileClose = viewChild<ElementRef<HTMLButtonElement>>('mobileClose');
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileNavigationOpen = signal(false);
  protected readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  protected readonly icons = { Bell, ChevronLeft, CircleUserRound, Compass, Menu, Plane, Radar, Search, ShieldCheck, X };

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.closeMobileNavigation());
    if (typeof window !== 'undefined') {
      merge(fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(() => this.online.set(navigator.onLine));
    }
  }

  protected toggleDesktopSidebar(): void { this.sidebarCollapsed.update((value) => !value); }

  protected openMobileNavigation(): void {
    this.previouslyFocused = this.document.activeElement as HTMLElement | null;
    this.mobileNavigationOpen.set(true);
    this.document.body.classList.add('overflow-hidden');
    queueMicrotask(() => this.mobileClose()?.nativeElement.focus());
  }

  protected closeMobileNavigation(): void {
    if (!this.mobileNavigationOpen()) return;
    this.mobileNavigationOpen.set(false);
    this.document.body.classList.remove('overflow-hidden');
    this.previouslyFocused?.focus();
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void { this.closeMobileNavigation(); }
}
