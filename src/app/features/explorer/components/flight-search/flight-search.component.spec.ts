import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightSearchComponent } from './flight-search.component';

function dispatchSubmit(fixture: ComponentFixture<FlightSearchComponent>): Event {
  const event = new Event('submit', { bubbles: true, cancelable: true });
  const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
  form.dispatchEvent(event);
  return event;
}

describe('FlightSearchComponent', () => {
  let fixture: ComponentFixture<FlightSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FlightSearchComponent] });
    fixture = TestBed.createComponent(FlightSearchComponent);
    fixture.componentRef.setInput('mode', 'flight');
    fixture.componentRef.setInput('query', 'UAL1234');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('emits searchRequest and prevents default on submit', () => {
    const request = vi.fn();
    fixture.componentInstance.searchRequest.subscribe(request);
    const event = dispatchSubmit(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(request).toHaveBeenCalledOnce();
  });

  it('does not emit searchRequest while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const request = vi.fn();
    fixture.componentInstance.searchRequest.subscribe(request);
    dispatchSubmit(fixture);
    expect(request).not.toHaveBeenCalled();
  });
});
