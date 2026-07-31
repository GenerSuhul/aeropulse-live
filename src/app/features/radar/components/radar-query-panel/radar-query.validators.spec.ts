import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { finiteRangeValidator, positiveRadiusValidator } from './radar-query.validators';

describe('validadores de consulta Radar', () => {
  it('valida los límites de latitud y longitud', () => {
    const latitude = new FormControl(91, finiteRangeValidator(-90, 90));
    const longitude = new FormControl(-181, finiteRangeValidator(-180, 180));
    expect(latitude.valid).toBe(false); expect(longitude.valid).toBe(false);
    latitude.setValue(16.3258); longitude.setValue(-89.4161);
    expect(latitude.valid).toBe(true); expect(longitude.valid).toBe(true);
  });

  it('rechaza radios no positivos o mayores que 250 NM', () => {
    const radius = new FormControl(0, positiveRadiusValidator);
    expect(radius.invalid).toBe(true); radius.setValue(251); expect(radius.invalid).toBe(true); radius.setValue(250); expect(radius.valid).toBe(true);
  });
});
