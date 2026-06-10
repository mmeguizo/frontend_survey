import { gql } from "apollo-server-express";

export const ticketTypeDefs = gql`
  enum TicketType {
    MIS
    ITS
  }

  enum TicketStatus {
    FOR_REVIEW
    REVIEWED
    DIRECTOR_APPROVED
    ASSIGNED
    PENDING
    IN_PROGRESS
    ON_HOLD
    RESOLVED
    CLOSED
    CANCELLED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum MISCategory {
    WEBSITE
    SOFTWARE
  }

  type Ticket {
    id: Int!
    ticketNumber: String!
    controlNumber: String
    type: TicketType!
    title: String!
    description: String!
    status: TicketStatus!
    priority: Priority!
    dueDate: String
    estimatedDuration: Int
    actualDuration: Int
    secretaryReviewedById: Int
    secretaryReviewedAt: String
    directorApprovedById: Int
    directorApprovedAt: String
    # Head workflow
    assignedDeveloperName: String
    dateToVisit: String
    targetCompletionDate: String
    resolution: String
    dateFinished: String
    # Escalation
    escalatedAt: String
    escalationLevel: Int!
    # Satisfaction survey (legacy star rating — kept for backward compatibility)
    satisfactionRating: Int
    satisfactionComment: String
    # Official ARTA Client Satisfaction Survey (new)
    clientSatisfactionSurvey: ClientSatisfactionSurvey
    createdBy: User!
    createdById: Int!
    misTicket: MISTicket
    itsTicket: ITSTicket
    assignments: [TicketAssignment!]!
    notes: [TicketNote!]!
    attachments: [TicketAttachment!]!
    statusHistory: [TicketStatusHistory!]!
    createdAt: String!
    updatedAt: String!
    resolvedAt: String
    closedAt: String
  }

  type MISTicket {
    id: Int!
    ticketId: Int!
    category: MISCategory!
    websiteNewRequest: Boolean!
    websiteUpdate: Boolean!
    softwareNewRequest: Boolean!
    softwareUpdate: Boolean!
    softwareInstall: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ITSTicket {
    id: Int!
    ticketId: Int!
    borrowRequest: Boolean!
    borrowDetails: String
    maintenanceDesktopLaptop: Boolean!
    maintenanceInternetNetwork: Boolean!
    maintenancePrinter: Boolean!
    maintenanceDetails: String
    createdAt: String!
    updatedAt: String!
  }

  type TicketAssignment {
    id: Int!
    ticketId: Int!
    userId: Int!
    user: User!
    assignedAt: String!
  }

  type TicketNote {
    id: Int!
    ticketId: Int!
    userId: Int!
    user: User!
    content: String!
    isInternal: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type TicketAttachment {
    id: Int!
    ticketId: Int!
    filename: String!
    originalName: String!
    mimeType: String!
    size: Int!
    url: String!
    uploadedBy: User
    isDeleted: Boolean!
    deletedAt: String
    deletedBy: User
    createdAt: String!
  }

  type TicketStatusHistory {
    id: Int!
    ticketId: Int!
    userId: Int!
    user: User!
    fromStatus: TicketStatus
    toStatus: TicketStatus!
    comment: String
    createdAt: String!
  }

  type TicketAnalytics {
    total: Int!
    byStatus: [StatusCount!]!
    byType: [TypeCount!]!
    byPriority: [PriorityCount!]!
  }

  type StatusCount {
    status: TicketStatus!
    count: Int!
  }

  type TypeCount {
    type: TicketType!
    count: Int!
  }

  type PriorityCount {
    priority: Priority!
    count: Int!
  }

  type SLAMetrics {
    overdue: Int!
    dueToday: Int!
    dueSoon: Int!
    complianceRate: Float!
    totalResolved: Int!
    resolvedWithinSLA: Int!
    averageResolutionHours: Float
    overdueTickets: [Ticket!]!
  }

  type TicketTrendPoint {
    date: String!
    count: Int!
  }

  type StaffPerformance {
    userId: Int!
    name: String!
    role: String!
    totalAssigned: Int!
    totalResolved: Int!
    averageResolutionHours: Float
    slaComplianceRate: Float!
  }

  type TicketTrends {
    createdPerDay: [TicketTrendPoint!]!
    resolvedPerDay: [TicketTrendPoint!]!
  }

  # ========================================
  # CLIENT SATISFACTION SURVEY (ARTA CSM)
  # Official per PSA Approval No.: ARTA-2331-3
  # ========================================

  type ClientSatisfactionSurvey {
    id: Int!
    ticketId: Int!
    ticket: Ticket!
    userId: Int!
    user: User!

    # Page 1 — Demographics
    clientType: String
    date: String
    sex: String
    age: Int
    regionOfResidence: String

    # Service Availed
    serviceTalisay: Boolean!
    serviceExternal: Boolean!

    # Citizen's Charter
    cc1Awareness: Int
    cc2Visibility: Int
    cc3Helpfulness: Int

    # Service Quality Dimensions
    sqd0: Int
    sqd1: Int
    sqd2: Int
    sqd3: Int
    sqd4: Int
    sqd5: Int
    sqd6: Int
    sqd7: Int
    sqd8: Int

    # Footer
    suggestions: String
    emailAddress: String

    createdAt: String!
    updatedAt: String!
  }

  type SurveyAnalytics {
    totalSurveys: Int!
    averageSqdScores: [SqdAverage!]!
    ccAwarenessDistribution: [CcDistribution!]!
    clientTypeDistribution: [DistributionCount!]!
    satisfactionOverTime: [SatisfactionTrendPoint!]!
  }

  type SqdAverage {
    dimension: String!
    average: Float!
    count: Int!
  }

  type CcDistribution {
    code: Int!
    label: String!
    count: Int!
  }

  type DistributionCount {
    key: String!
    count: Int!
  }

  type SatisfactionTrendPoint {
    date: String!
    averageSqdScore: Float!
    count: Int!
  }

  type PaginatedSurveys {
    items: [ClientSatisfactionSurvey!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  input CreateMISTicketInput {
    title: String!
    description: String!
    priority: Priority
    category: MISCategory!
    websiteNewRequest: Boolean
    websiteUpdate: Boolean
    softwareNewRequest: Boolean
    softwareUpdate: Boolean
    softwareInstall: Boolean
    estimatedDuration: Int
  }

  input CreateITSTicketInput {
    title: String!
    description: String!
    priority: Priority
    borrowRequest: Boolean
    borrowDetails: String
    maintenanceDesktopLaptop: Boolean
    maintenanceInternetNetwork: Boolean
    maintenancePrinter: Boolean
    maintenanceDetails: String
    estimatedDuration: Int
  }

  input UpdateTicketStatusInput {
    status: TicketStatus!
    comment: String
    targetCompletionDate: String
  }

  # Input for assigning a ticket with optional schedule dates
  # Note: userId is passed as a separate parameter, not in this input
  input AssignTicketInput {
    dateToVisit: String
    targetCompletionDate: String
    comment: String
  }

  input CreateTicketNoteInput {
    content: String!
    isInternal: Boolean
  }

  input UpdateTicketNoteInput {
    isInternal: Boolean
    content: String
  }

  input ReopenTicketInput {
    updatedDescription: String
    comment: String
  }

  input UpdateTicketDescriptionInput {
    description: String!
  }

  # Input for head to acknowledge ticket and assign developer
  input AcknowledgeAndAssignInput {
    assignedDeveloperName: String!
    assignToUserId: Int
    dateToVisit: String
    targetCompletionDate: String
    comment: String
  }

  # Input for head to update ticket resolution
  input UpdateResolutionInput {
    resolution: String!
    dateFinished: String
    status: TicketStatus
    comment: String
    solutionVisibility: String
  }

  input SubmitSatisfactionInput {
    rating: Int!
    comment: String
  }

  input ClientSurveyInput {
    # Demographics
    clientType: String
    date: String
    sex: String
    age: Int
    regionOfResidence: String

    # Service Availed
    serviceTalisay: Boolean!
    serviceExternal: Boolean!

    # Citizen's Charter
    cc1Awareness: Int
    cc2Visibility: Int
    cc3Helpfulness: Int

    # Service Quality Dimensions (1-5 or null for N/A)
    sqd0: Int
    sqd1: Int
    sqd2: Int
    sqd3: Int
    sqd4: Int
    sqd5: Int
    sqd6: Int
    sqd7: Int
    sqd8: Int

    # Footer
    suggestions: String
    emailAddress: String
  }

  input TicketFilterInput {
    status: TicketStatus
    type: TicketType
    createdById: Int
    assignedToUserId: Int
  }

  input PaginationInput {
    page: Int
    pageSize: Int
    sortField: String
    sortOrder: String
  }

  type PaginatedTickets {
    items: [Ticket!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  input AnalyticsFilterInput {
    startDate: String
    endDate: String
    type: TicketType
  }

  extend type Query {
    ticket(id: Int!): Ticket
    ticketByNumber(ticketNumber: String!): Ticket
    tickets(
      filter: TicketFilterInput
      pagination: PaginationInput
    ): PaginatedTickets!
    myTickets(pagination: PaginationInput): PaginatedTickets!
    myCreatedTickets(pagination: PaginationInput): PaginatedTickets!
    ticketsForSecretaryReview: [Ticket!]!
    ticketsPendingDirectorApproval: [Ticket!]!
    officeHeadTickets(type: TicketType!): PaginatedTickets!
    allSecretaryTickets(pagination: PaginationInput): PaginatedTickets!
    ticketAnalytics(filter: AnalyticsFilterInput): TicketAnalytics!
    slaMetrics(type: TicketType): SLAMetrics!
    ticketTrends(filter: AnalyticsFilterInput): TicketTrends!
    staffPerformance(filter: AnalyticsFilterInput): [StaffPerformance!]!
    # Client Satisfaction Survey queries (admin/staff)
    surveyResponses(
      filter: AnalyticsFilterInput
      pagination: PaginationInput
    ): PaginatedSurveys!
    surveyAnalytics(filter: AnalyticsFilterInput): SurveyAnalytics!
  }

  extend type Mutation {
    createMISTicket(input: CreateMISTicketInput!): Ticket!
    createITSTicket(input: CreateITSTicketInput!): Ticket!
    updateTicketStatus(ticketId: Int!, input: UpdateTicketStatusInput!): Ticket!
    reviewTicketAsSecretary(ticketId: Int!, comment: String): Ticket!
    rejectTicketAsSecretary(ticketId: Int!, reason: String!): Ticket!
    approveTicketAsDirector(ticketId: Int!, comment: String): Ticket!
    disapproveTicketAsDirector(ticketId: Int!, reason: String!): Ticket!
    assignTicket(
      ticketId: Int!
      userId: Int!
      input: AssignTicketInput
    ): Ticket!
    unassignTicket(ticketId: Int!, userId: Int!): Ticket!
    addTicketNote(ticketId: Int!, input: CreateTicketNoteInput!): TicketNote!
    # Note management: staff can update visibility or delete a note
    updateTicketNote(noteId: Int!, input: UpdateTicketNoteInput!): TicketNote!
    deleteTicketNote(noteId: Int!): Boolean!
    reopenTicket(ticketId: Int!, input: ReopenTicketInput): Ticket!
    updateTicketDescription(
      ticketId: Int!
      input: UpdateTicketDescriptionInput!
    ): Ticket!
    # Head workflow: acknowledge ticket and assign developer name
    acknowledgeAndAssignDeveloper(
      ticketId: Int!
      input: AcknowledgeAndAssignInput!
    ): Ticket!
    # Head workflow: update resolution after work is done
    updateResolution(ticketId: Int!, input: UpdateResolutionInput!): Ticket!
    # Attachment management
    deleteTicketAttachment(attachmentId: Int!): Boolean!
    # Satisfaction survey (legacy star rating)
    submitSatisfaction(ticketId: Int!, input: SubmitSatisfactionInput!): Ticket!
    # Official ARTA Client Satisfaction Survey
    submitClientSatisfactionSurvey(
      ticketId: Int!
      input: ClientSurveyInput!
    ): ClientSatisfactionSurvey!
  }
`;
