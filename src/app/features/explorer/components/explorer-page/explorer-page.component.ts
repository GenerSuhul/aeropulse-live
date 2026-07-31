import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { AircraftDetailCardComponent } from '../aircraft-detail-card/aircraft-detail-card.component';
import { AirlineDetailCardComponent } from '../airline-detail-card/airline-detail-card.component';
import { ConsultedFlightsListComponent } from '../consulted-flights-list/consulted-flights-list.component';
import { ExplorerEmptyStateComponent } from '../explorer-empty-state/explorer-empty-state.component';
import { ExplorerErrorStateComponent } from '../explorer-error-state/explorer-error-state.component';
import { ExplorerHeaderComponent } from '../explorer-header/explorer-header.component';
import { ExplorerLoadingComponent } from '../explorer-loading/explorer-loading.component';
import { FlightRouteCardComponent } from '../flight-route-card/flight-route-card.component';
import { FlightSearchComponent } from '../flight-search/flight-search.component';
import { ExplorerFacade } from '../../services/explorer.facade';

@Component({
  selector: 'app-explorer-page',
  host: { class: 'block min-w-0' },
  imports: [AircraftDetailCardComponent, AirlineDetailCardComponent, ConsultedFlightsListComponent, ExplorerEmptyStateComponent, ExplorerErrorStateComponent, ExplorerHeaderComponent, ExplorerLoadingComponent, FlightRouteCardComponent, FlightSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1800px] space-y-4">
      <app-explorer-header [online]="facade.online()" [lastUpdated]="facade.lastUpdated()" />
      <app-flight-search [mode]="facade.mode()" [query]="facade.query()" [loading]="facade.loading()" (modeChange)="facade.setMode($event)" (queryChange)="facade.setQuery($event)" (searchRequest)="facade.search()" />
      <div class="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
        <section class="min-w-0" aria-label="Resultados de la consulta">
          @if (facade.loading()) {
            <app-explorer-loading />
          } @else if (facade.error(); as error) {
            @if (error.kind === 'not-found') {
              <app-explorer-empty-state [title]="'Sin resultados'" [detail]="error.message" (action)="newSearch()" />
            } @else {
              <app-explorer-error-state [error]="error" (retry)="facade.retry()" />
            }
          } @else {
            <div class="space-y-4">
              @if (facade.resultAircraft(); as aircraft) { <app-aircraft-detail-card [aircraft]="aircraft" /> }
              @if (facade.resultRoute(); as route) { <app-flight-route-card [route]="route" /> }
              @if (facade.resultAirlines(); as airlines) { <app-airline-detail-card [airlines]="airlines" [routes]="facade.airlineRoutes()" /> }
              @if (!facade.resultAircraft() && !facade.resultRoute() && facade.resultAirlines().length === 0) {
                <app-explorer-empty-state [title]="'Explora el tráfico de referencia'" [detail]="'Busca por número de vuelo, matrícula o código de aerolínea para consultar sus datos reales en ADSBDB.'" (action)="newSearch()" />
              }
            </div>
          }
        </section>
        <aside class="min-w-0">
          <app-consulted-flights-list [flights]="facade.consultedFlights()" [selectedRoute]="facade.selectedRoute()" (flightSelect)="facade.selectFlight($event)" />
        </aside>
      </div>
    </div>
  `,
})
export class ExplorerPageComponent {
  readonly facade = inject(ExplorerFacade);
  protected readonly searchComponent = viewChild.required(FlightSearchComponent);

  protected newSearch(): void { this.searchComponent().focus(); }
}
