# Backend Architecture - Enterprise-Grade Structure

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Server bootstrap
│   ├── context.ts                  # GraphQL context (uses new services)
│   ├── config/                     # Configuration
│   │   ├── index.ts               # App config
│   │   └── auth.ts                # Auth config
│   ├── lib/                        # Shared utilities
│   │   ├── prisma.ts              # Prisma singleton
│   │   ├── errors.ts              # Custom error classes
│   │   └── logger.ts              # Logger utility
│   ├── common/                     # Shared across modules
│   │   └── base-schema.ts         # Base GraphQL schema
│   └── modules/                    # Feature modules
│       ├── auth/
│       │   ├── jwt.service.ts     # JWT authentication
│       │   └── auth0.service.ts   # Auth0 integration
│       ├── users/
│       │   ├── user.types.ts      # GraphQL types
│       │   ├── user.resolvers.ts  # GraphQL resolvers
│       │   ├── user.service.ts    # Business logic
│       │   ├── user.repository.ts # Data access
│       │   ├── user.validators.ts # Input validation (Zod)
│       │   └── index.ts           # Module exports
│       └── storage/
│           └── storage.service.ts  # File storage service
```

## 🏗️ Architecture Layers

### 1. **Resolvers Layer** (GraphQL Entry Point)

- Handles GraphQL requests
- Validates user authorization
- Delegates to service layer

```typescript
// Example: user.resolvers.ts
export const userResolvers = {
  Query: {
    users: async (_: any, __: any, ctx: Context) => {
      return ctx.userService.getAll();
    },
  },
};
```

### 2. **Service Layer** (Business Logic)

- Contains all business rules
- Validates input with Zod
- Orchestrates between repositories
- Handles errors

```typescript
// Example: user.service.ts
export class UserService {
  async create(input: CreateUserInput): Promise<User> {
    // 1. Validate input
    const validation = createUserSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Invalid data", validation.error);
    }

    // 2. Business logic
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("User already exists");
    }

    // 3. Data access
    return this.userRepo.create(input);
  }
}
```

### 3. **Repository Layer** (Data Access)

- Direct Prisma interactions
- CRUD operations
- Query building

```typescript
// Example: user.repository.ts
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }
}
```

### 4. **Validation Layer** (Zod Schemas)

- Type-safe input validation
- Reusable schemas
- Automatic error messages

```typescript
// Example: user.validators.ts
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
  password: z.string().min(8).optional(),
});
```

## 🔑 Key Improvements

### ✅ Separation of Concerns

- Each layer has one responsibility
- Easy to test in isolation
- Changes don't cascade

### ✅ Type Safety

- End-to-end TypeScript
- Zod validation generates types
- Prisma types throughout

### ✅ Error Handling

- Custom error classes
- Consistent error responses
- GraphQL-formatted errors

### ✅ Modularity

- Feature-based modules
- Easy to add new features
- Independent development

### ✅ Testability

- Mock services easily
- Test business logic without DB
- Integration tests possible

### ✅ Scalability

- Add modules without touching existing code
- Clear dependencies
- Can extract to microservices later

## 🚀 Adding a New Module

### Example: Tickets Module

1. **Create folder structure:**

```
modules/tickets/
├── ticket.types.ts
├── ticket.resolvers.ts
├── ticket.service.ts
├── ticket.repository.ts
├── ticket.validators.ts
└── index.ts
```

2. **Create Prisma model:**

```prisma
model Ticket {
  id          Int      @id @default(autoincrement())
  formType    String   // 'MIS' or 'ITS'
  requesterName String
  department  String
  status      String   @default("PENDING")
  createdAt   DateTime @default(now())
  // ... other fields
}
```

3. **Create validator:**

```typescript
// ticket.validators.ts
export const createTicketSchema = z.object({
  formType: z.enum(["MIS", "ITS"]),
  requesterName: z.string().min(2),
  department: z.string().min(2),
  // ... other fields
});
```

4. **Create repository:**

```typescript
// ticket.repository.ts
export class TicketRepository {
  async create(data: any): Promise<Ticket> {
    return prisma.ticket.create({ data });
  }

  async findAll(): Promise<Ticket[]> {
    return prisma.ticket.findMany();
  }
}
```

5. **Create service:**

```typescript
// ticket.service.ts
export class TicketService {
  constructor(private ticketRepo: TicketRepository) {}

  async create(input: CreateTicketInput): Promise<Ticket> {
    const validation = createTicketSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Invalid ticket", validation.error);
    }

    return this.ticketRepo.create(validation.data);
  }
}
```

6. **Create resolvers:**

```typescript
// ticket.resolvers.ts
export const ticketResolvers = {
  Query: {
    tickets: async (_: any, __: any, ctx: Context) => {
      return ctx.ticketService.getAll();
    },
  },
  Mutation: {
    createTicket: async (_: any, args: { input: any }, ctx: Context) => {
      return ctx.ticketService.create(args.input);
    },
  },
};
```

7. **Add to index.ts:**

```typescript
import { ticketTypeDefs, ticketResolvers } from "./modules/tickets";

const typeDefs = [baseTypeDefs, userTypeDefs, ticketTypeDefs];
const resolvers = [userResolvers, ticketResolvers];
```

## 🔧 Configuration

All configuration is centralized in `config/` folder:

- `config/index.ts` - App settings (port, env, CORS)
- `config/auth.ts` - Auth0 and JWT settings

Environment variables are loaded from `.env` file.

## 📝 Error Handling

Custom error classes provide consistent error responses:

```typescript
throw new ValidationError("Invalid input", details);
throw new UnauthorizedError("Login required");
throw new NotFoundError("User");
throw new ConflictError("Email already exists");
```

All errors are automatically formatted for GraphQL responses.

## 🧪 Testing Strategy

### Unit Tests

- Test services with mocked repositories
- Test validators independently
- Test business logic

### Integration Tests

- Test resolvers with real database
- Test full request/response cycle
- Use test database

### Example:

```typescript
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockUser),
    };

    const service = new UserService(mockRepo, ...);
    const result = await service.create(validInput);

    expect(result).toEqual(mockUser);
  });
});
```

## 🎯 Best Practices

1. **Keep services thin** - Delegate complex queries to repositories
2. **Validate early** - Use Zod at service entry points
3. **Handle errors properly** - Use custom error classes
4. **Log important events** - Use the logger utility
5. **Type everything** - No `any` types in production code
6. **Document complex logic** - Add comments for business rules
7. **Keep resolvers simple** - Just call services
8. **Use dependency injection** - Pass dependencies to constructors

## 🔄 Migration from Old Structure

### Old Structure (Flat)

```
src/
├── auth.ts (80 lines)
├── resolvers.ts (150 lines)
├── schema.ts (60 lines)
└── context.ts (100 lines)
```

### New Structure (Modular)

```
src/
├── modules/
│   ├── auth/ (2 services, 150 lines)
│   ├── users/ (5 files, 400 lines)
│   └── storage/ (1 service, 100 lines)
├── lib/ (3 utilities, 150 lines)
└── config/ (2 files, 30 lines)
```

**Benefits:**

- Easier to find code (by feature)
- Easier to test (smaller units)
- Easier to scale (add modules)
- Easier to maintain (clear responsibilities)

## 📚 Next Steps

1. ✅ Foundation infrastructure (Prisma, errors, logger)
2. ✅ Config module
3. ✅ Auth module (JWT + Auth0)
4. ✅ Users module (full CRUD)
5. ✅ Storage module
6. ✅ Tickets module (MIS/ITS forms, approval workflow)
7. ✅ Client Satisfaction Measurement (CSM) Survey module
8. Add Departments module
9. Add Reports module
10. Add unit tests
11. Add API documentation (GraphQL Playground)

## 🤝 Contributing

When adding new features:

1. Follow the modular structure
2. Use Zod for validation
3. Keep services focused
4. Add proper error handling
5. Log important operations
6. Update this README

---

**Architecture Pattern:** Layered Architecture + Repository Pattern + Dependency Injection
**Technologies:** Node.js, TypeScript, GraphQL, Apollo Server, Prisma, MySQL, Zod
