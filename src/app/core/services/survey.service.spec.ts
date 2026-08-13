import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from '../models/survey.model';
import { environment } from '../../../environments/environment';

describe('SurveyService', () => {
  let service: SurveyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SurveyService],
    });

    service = TestBed.inject(SurveyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitSurvey()', () => {
    it('should send POST request to correct URL', () => {
      const mockSurvey: CreateSurveyDto = {
        clientType: 'CITIZEN',
        date: '2024-01-01',
        sex: 'MALE',
        age: 30,
      };

      service.submitSurvey(mockSurvey).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/surveys`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSurvey);
      req.flush(mockSurvey);
    });
  });

  describe('getSurveys()', () => {
    it('should send GET request with correct params', () => {
      const mockResponse = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };

      service.getSurveys(1, 10).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/surveys?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should send GET request with search param', () => {
      const mockResponse = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };

      service.getSurveys(1, 10, 'TKT-001').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/surveys?page=1&limit=10&search=TKT-001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getSurveyById()', () => {
    it('should send GET request to correct URL', () => {
      const mockSurvey = { id: 1, ticketId: 'TKT-001' };

      service.getSurveyById(1).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/surveys/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSurvey);
    });
  });

  describe('getAnalytics()', () => {
    it('should send GET request to analytics endpoint', () => {
      const mockAnalytics = { totalSurveys: 0, averageSqd: 0, clientTypeDistribution: [], sqdAveragesPerQuestion: {} };

      service.getAnalytics().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/surveys/analytics/summary`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalytics);
    });
  });

  describe('login()', () => {
    it('should send POST request to login endpoint', () => {
      const loginData = { username: 'admin', password: 'password' };
      const mockResponse = { access_token: 'jwt-token' };

      service.login(loginData).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });
  });
});