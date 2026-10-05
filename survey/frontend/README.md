# Survey Application - Frontend README

## Overview
This is the Angular frontend for the Survey Application. It provides a public survey form and an admin dashboard for managing survey responses.

## Tech Stack
- **Angular**: Frontend framework (v17+)
- **Angular Material**: UI components
- **RxJS**: Reactive programming
- **ngx-qrcode**: QR code generation for print

## Prerequisites
- Node.js 18+ and npm
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions
1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see Environment Configuration section)
4. Start development server:
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`

## Environment Configuration
### Development (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

### Production (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-url/api',
};
```

## Available Scripts
| Script | Description |
|--------|-------------|
| `ng serve` | Start development server with hot reload |
| `ng build` | Build for production |
| `ng build --configuration production` | Build with production optimizations |
| `ng test` | Run Karma unit tests |
| `ng lint` | Run linting |

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   └── services/
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   │   ├── admin-login/
│   │   │   │   ├── survey-list/
│   │   │   │   ├── survey-analytics/
│   │   │   │   └── print-qr/
│   │   │   └── survey/
│   │   │       └── survey-form/
│   │   └── app.config.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss
│   └── main.ts
├── angular.json
└── package.json
```

## Key Features
### Public Survey Form (`/survey`)
- Multi-step form with Material Stepper
- Step 1: Demographics + Citizen's Charter questions
- Step 2: Service Quality Dimensions (SQD) ratings
- Step 3: Review and Submit
- Conditional logic for CC2/CC3 based on CC1 answer
- Form validation with error messages

### Admin Dashboard (`/admin`)
- Login page (`/admin/login`)
- Survey list with search and pagination (`/admin/surveys`)
- Analytics dashboard (`/admin/analytics`)
- QR code generator for public survey URL (`/admin/qr`)

## Testing
Run Karma/Jasmine unit tests:
```bash
ng test
```

Run tests in headless mode:
```bash
ng test --watch=false --browsers=ChromeHeadless
```

## Build for Production
```bash
ng build --configuration production
```
Output will be in `dist/frontend/browser/`.

## cPanel Deployment
1. Build the production bundle
2. Zip the contents of `dist/frontend/browser/`
3. Upload to cPanel File Manager
4. Extract to `public_html/`
5. Configure `.htaccess` for SPA routing:
   ```
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

## Angular Material Theme
The project uses a custom theme based on the "indigo-pink" palette, with CHMSU branding colors:
- Primary: `#004d40`
- Accent: `#ffab00`
- Warn: `#f44336`

## License
MIT License