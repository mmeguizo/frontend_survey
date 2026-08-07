import { OFFICE_SERVICES } from './office-services';

describe('OFFICE_SERVICES data catalog', () => {
  it('contains the full set of offices', () => {
    expect(OFFICE_SERVICES.length).toBe(18);
  });

  it('uses unique, stable office ids separate from display labels', () => {
    const ids = OFFICE_SERVICES.map(o => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    OFFICE_SERVICES.forEach(o => {
      expect(o.id).toBeTruthy();
      expect(o.id).not.toBe(o.label);
    });
  });

  it('gives every office at least one service with unique stable ids', () => {
    OFFICE_SERVICES.forEach(office => {
      expect(office.services.length).toBeGreaterThan(0);
      const serviceIds = office.services.map(s => s.id);
      expect(new Set(serviceIds).size).toBe(serviceIds.length);
      office.services.forEach(service => {
        expect(service.id).toBeTruthy();
        expect(service.id).not.toBe(service.label);
      });
    });
  });

  it('tags every service with a valid internal/external classification', () => {
    OFFICE_SERVICES.forEach(office => {
      office.services.forEach(service => {
        expect(['INTERNAL', 'EXTERNAL']).toContain(service.internalExternal);
      });
    });
  });

  it('tags all services as INTERNAL for now', () => {
    OFFICE_SERVICES.forEach(office => {
      office.services.forEach(service => {
        expect(service.internalExternal).toBe('INTERNAL');
      });
    });
  });

  it('keeps display labels exactly as authored (apostrophes and parentheticals)', () => {
    expect(OFFICE_SERVICES.some(o => o.label === "Registrar's Office")).toBeTrue();
    expect(
      OFFICE_SERVICES.some(o =>
        o.services.some(s => s.label === "Signing of Student's Clearance")
      )
    ).toBeTrue();
    expect(
      OFFICE_SERVICES.some(o =>
        o.services.some(
          s => s.label === 'Application for Booking of Facilities (Dining and Function Hall)'
        )
      )
    ).toBeTrue();
  });

  it('includes at least one office with multiple services and one office with a single service', () => {
    expect(OFFICE_SERVICES.some(o => o.services.length > 1)).toBe(true);
    expect(OFFICE_SERVICES.some(o => o.services.length === 1)).toBe(true);
  });

  it('lists the Business Affairs Office with four services', () => {
    const business = OFFICE_SERVICES.find(o => o.id === 'business-affairs');
    expect(business).toBeDefined();
    expect(business!.services.map(s => s.label)).toEqual([
      'Application for Rental of Facilities',
      'Request for Bookstore Services',
      'Request for Printing Services',
      'Request for Shop Services',
    ]);
  });
});